import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import CatchForm from './components/CatchForm'
import CatchList from './components/CatchList'
import './index.css'

function App() {
  const [catches, setCatches] = useState([])
  const [loading, setLoading] = useState(true)

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
          bait: newCatch.bait,
          location: newCatch.location,
          air_temp: newCatch.airTemp ? parseFloat(newCatch.airTemp) : null,
          water_temp: newCatch.waterTemp ? parseFloat(newCatch.waterTemp) : null,
          image_url: imageUrl
        }])

      if (error) throw error
      fetchCatches() // Refresh list
    } catch (error) {
      alert('Kunde inte spara fångsten: ' + error.message)
    }
  }

  return (
    <div>
      <h1>Min Fiskelogg 🎣</h1>
      <CatchForm onAddCatch={addCatch} />
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Laddar fångster...</p>
      ) : (
        <CatchList catches={catches} />
      )}
    </div>
  )
}

export default App
