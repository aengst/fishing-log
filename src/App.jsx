import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import CatchForm from './components/CatchForm'
import CatchList from './components/CatchList'
import 'leaflet/dist/leaflet.css'
import './index.css'

function App() {
  const [catches, setCatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCatch, setEditingCatch] = useState(null)

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
      fetchCatches()
    } catch (error) {
      alert('Kunde inte ta bort: ' + error.message)
    }
  }

  const updateCatch = async (id, updatedData) => {
    try {
      // Handle image update if needed (omitted for brevity, user can delete/re-upload or we add complex logic later)
      // For now we update fields

      let imageUrl = editingCatch.image_url // Keep old image by default

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
      setEditingCatch(null) // Exit edit mode
      fetchCatches()
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
        editingCatch={editingCatch}
        onCancelEdit={() => setEditingCatch(null)}
      />
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Laddar fångster...</p>
      ) : (
        <CatchList
          catches={catches}
          onDelete={deleteCatch}
          onEdit={setEditingCatch}
        />
      )}
    </div>
  )
}

export default App
