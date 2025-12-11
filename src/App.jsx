import { useState } from 'react'
import { useCatches } from './hooks/useCatches'
import CatchForm from './components/catch-form'
import CatchList from './components/CatchList'
import 'leaflet/dist/leaflet.css'
import './index.css'

function App() {
  const { catches, loading, addCatch, deleteCatch, updateCatch } = useCatches()
  const [selectedCatch, setSelectedCatch] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleDelete = async (id) => {
    if (!confirm('Är du säker på att du vill ta bort fångsten?')) return;
    try {
      await deleteCatch(id);
      if (selectedCatch && selectedCatch.id === id) {
        setSelectedCatch(null);
        setIsEditing(false);
      }
    } catch (error) {
      alert('Kunde inte ta bort: ' + error.message);
    }
  }

  const handleAddCatch = async (newCatch) => {
    try {
      await addCatch(newCatch);
    } catch (error) {
      alert('Kunde inte spara fångsten: ' + error.message);
    }
  }

  const handleUpdateCatch = async (id, updatedData) => {
    try {
      await updateCatch(id, updatedData, selectedCatch.image_url);
      setIsEditing(false);
      setSelectedCatch(null); // Or find the updated one if we return it?
    } catch (error) {
      alert('Kunde inte uppdatera: ' + error.message);
    }
  }

  const viewCatch = (catchItem) => {
    setSelectedCatch(catchItem);
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditing = () => {
    if (selectedCatch) {
      setIsEditing(true);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const closeSelection = () => {
    setSelectedCatch(null);
    setIsEditing(false);
  }

  return (
    <div>
      <h1>Min Fiskelogg 🎣</h1>
      <CatchForm
        onAddCatch={handleAddCatch}
        onUpdateCatch={handleUpdateCatch}
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
          onDelete={handleDelete}
          onView={viewCatch}
        />
      )}
    </div>
  )
}

export default App
