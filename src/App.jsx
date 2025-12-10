import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import CatchForm from './components/CatchForm'
import CatchList from './components/CatchList'
import 'leaflet/dist/leaflet.css'
import './index.css'

function App() {
  const [catches, setCatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCatch, setSelectedCatch] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchCatches()
  }, [])

  const fetchCatches = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('catches')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCatches(data || [])
    } catch (error) {
      console.error('Error fetching catches:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const addCatch = async (newCatch) => {
    try {
      let imageUrl = null

      if (newCatch.image) {
        const fileExt = newCatch.image.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('catch-images')
          .upload(fileName, newCatch.image)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('catch-images')
          .getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      const { error } = await supabase
        .from('catches')
        .insert([{
          species: newCatch.species,
          weight: parseFloat(newCatch.weight),
          length: newCatch.length ? parseFloat(newCatch.length) : null,
          bait: newCatch.bait,
          location: newCatch.location,
          air_temp: newCatch.airTemp ? parseFloat(newCatch.airTemp) : null,
          water_temp: newCatch.waterTemp ? parseFloat(newCatch.waterTemp) : null,
          catch_date: newCatch.catchDate ? new Date(newCatch.catchDate).toISOString() : new Date().toISOString(),
          latitude: newCatch.lat,
          longitude: newCatch.lng,
          image_url: imageUrl,
          wind_speed: newCatch.windSpeed ? parseFloat(newCatch.windSpeed) : null,
          wind_direction: newCatch.windDirection ? parseFloat(newCatch.windDirection) : null,
          weather_description: newCatch.weatherDescription || null
        }])

      if (error) throw error
      fetchCatches() // Refresh list
    } catch (error) {
      alert('Kunde inte spara fångsten: ' + error.message)
    }
  }

  const deleteCatch = async (id) => {
    if (!confirm('Är du säker på att du vill ta bort fångsten?')) return;

    try {
      const { error } = await supabase
        .from('catches')
        .delete()
        .eq('id', id)

      if (error) throw error
      if (selectedCatch && selectedCatch.id === id) {
        setSelectedCatch(null);
        setIsEditing(false);
      }
      fetchCatches()
    } catch (error) {
      alert('Kunde inte ta bort: ' + error.message)
    }
  }

  const viewCatch = (catchItem) => {
    setSelectedCatch(catchItem);
    setIsEditing(false); // Default to read-only view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditing = () => {
    if (selectedCatch) {
      setIsEditing(true);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    // If we were just viewing, stay on selectedCatch but read-only.
  };

  const closeSelection = () => {
    setSelectedCatch(null);
    setIsEditing(false);
  }


  const updateCatch = async (id, updatedData) => {
    try {
      // Handle image update if needed (omitted for brevity, user can delete/re-upload or we add complex logic later)
      // For now we update fields

      let imageUrl = selectedCatch.image_url // Keep old image by default

      if (updatedData.image) {
        const fileExt = updatedData.image.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('catch-images')
          .upload(fileName, updatedData.image)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('catch-images')
          .getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      const { error } = await supabase
        .from('catches')
        .update({
          species: updatedData.species,
          weight: parseFloat(updatedData.weight),
          length: updatedData.length ? parseFloat(updatedData.length) : null,
          bait: updatedData.bait,
          location: updatedData.location,
          air_temp: updatedData.airTemp ? parseFloat(updatedData.airTemp) : null,
          water_temp: updatedData.waterTemp ? parseFloat(updatedData.waterTemp) : null,
          catch_date: updatedData.catchDate ? new Date(updatedData.catchDate).toISOString() : null,
          latitude: updatedData.lat,
          longitude: updatedData.lng,
          image_url: imageUrl,
          wind_speed: updatedData.windSpeed ? parseFloat(updatedData.windSpeed) : null,
          wind_direction: updatedData.windDirection ? parseFloat(updatedData.windDirection) : null,
          weather_description: updatedData.weatherDescription || null
        })
        .eq('id', id)

      if (error) throw error

      // Update local state to reflect changes immediately in View mode
      const updatedCatch = { ...selectedCatch, ...updatedData, image_url: imageUrl };
      // Map back to DB field names if needed for view state, but fetchCatches checks DB.
      // Easiest is to just refresh list and keep selection open? 
      // Or just close selection. Let's close selection for now as "Save" usually implies done.
      // But user might want to see it. Let's switch back to Read-Only view of the updated item.

      setIsEditing(false);
      // We need to refresh the list to get exact DB state (dates etc)
      fetchCatches();
      // We also need to update selectedCatch to show new values in Read-Only
      // We'll rely on fetchCatches to get data, but selectedCatch needs update.
      // Ideally we find the new item in the new list. 
      // For simpler logic, let's just close for now or Re-fetch and Find.
      // We'll just set selection to null to be safe, or user can re-select.
      // Actually, better UX: Go back to view mode.
      setSelectedCatch(null);
    } catch (error) {
      alert('Kunde inte uppdatera: ' + error.message)
    }
  }

  return (
    <div>
      <h1>Min Fiskelogg 🎣</h1>
      <CatchForm
        onAddCatch={addCatch}
        onUpdateCatch={updateCatch}
        selectedCatch={selectedCatch}
        isEditing={isEditing}
        onStartEdit={startEditing}
        onCancelEdit={cancelEdit}
        onClose={closeSelection}
      />
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Laddar fångster...</p>
      ) : (
        <CatchList
          catches={catches}
          onDelete={deleteCatch}
          onView={viewCatch}
        />
      )}
    </div>
  )
}

export default App
