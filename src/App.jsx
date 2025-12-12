import { useState, useMemo } from 'react'
import { useCatches } from './hooks/useCatches'
import CatchForm from './components/catch-form'
import CatchList from './components/CatchList'
import FilterSortBar from './components/FilterSortBar'
import 'leaflet/dist/leaflet.css'
import './index.css'

function App() {
  const { catches, loading, addCatch, deleteCatch, updateCatch } = useCatches()
  const [selectedCatch, setSelectedCatch] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isFormCollapsed, setIsFormCollapsed] = useState(true)
  const [isCompactView, setIsCompactView] = useState(false)
  const [isFilterVisible, setIsFilterVisible] = useState(false)

  // Filter & Sort State
  const [filterCriteria, setFilterCriteria] = useState({
    species: '',
    method: '',
    bait: '',
    year: '',
    month: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // Filter & Sort Logic
  const processedCatches = useMemo(() => {
    let result = [...catches];

    // 1. Filter
    if (filterCriteria.species) {
      result = result.filter(c => c.species === filterCriteria.species);
    }
    if (filterCriteria.method) {
      result = result.filter(c => c.fishing_method === filterCriteria.method);
    }
    if (filterCriteria.bait) {
      result = result.filter(c => c.bait === filterCriteria.bait);
    }
    if (filterCriteria.year) {
      result = result.filter(c => {
        const date = c.catch_date ? new Date(c.catch_date) : new Date(c.created_at);
        return date.getFullYear().toString() === filterCriteria.year;
      });
    }
    if (filterCriteria.month) {
      result = result.filter(c => {
        const date = c.catch_date ? new Date(c.catch_date) : new Date(c.created_at);
        return date.getMonth().toString() === filterCriteria.month;
      });
    }

    // 2. Sort
    result.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'date':
          aValue = a.catch_date ? new Date(a.catch_date) : new Date(a.created_at);
          bValue = b.catch_date ? new Date(b.catch_date) : new Date(b.created_at);
          break;
        case 'weight':
          aValue = parseFloat(a.weight) || 0;
          bValue = parseFloat(b.weight) || 0;
          break;
        case 'length':
          aValue = parseFloat(a.length) || 0;
          bValue = parseFloat(b.length) || 0;
          break;
        case 'species':
          aValue = a.species || '';
          bValue = b.species || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [catches, filterCriteria, sortConfig]);

  const handleFilterChange = (key, value) => {
    setFilterCriteria(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (config) => {
    setSortConfig(config);
  };


  const handleDelete = async (id) => {
    if (!confirm('Är du säker på att du vill ta bort fångsten?')) return;
    try {
      await deleteCatch(id);
      if (selectedCatch && selectedCatch.id === id) {
        setSelectedCatch(null);
        setIsEditing(false);
        setIsFormCollapsed(true);
      }
    } catch (error) {
      alert('Kunde inte ta bort: ' + error.message);
    }
  }

  const handleAddCatch = async (newCatch) => {
    try {
      await addCatch(newCatch);
      setIsFormCollapsed(true); // Auto-collapse after adding
    } catch (error) {
      alert('Kunde inte spara fångsten: ' + error.message);
    }
  }

  const handleUpdateCatch = async (id, updatedData) => {
    try {
      await updateCatch(id, updatedData, selectedCatch.image_url);
      setIsEditing(false);
      setSelectedCatch(null);
      setIsFormCollapsed(true); // Auto-collapse after updating
    } catch (error) {
      alert('Kunde inte uppdatera: ' + error.message);
    }
  }

  const viewCatch = (catchItem) => {
    setSelectedCatch(catchItem);
    setIsEditing(false);
    setIsFormCollapsed(false); // Expand when viewing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditing = () => {
    if (selectedCatch) {
      setIsEditing(true);
      setIsFormCollapsed(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    // Don't necessarily collapse here, just go back to view mode? 
    // Usually Cancel Edit -> View Mode. So keep expanded.
  };

  const closeSelection = () => {
    setSelectedCatch(null);
    setIsEditing(false);
    setIsFormCollapsed(true); // Collapse when closing
  }

  const openNewCatchForm = () => {
    setSelectedCatch(null);
    setIsEditing(false);
    setIsFormCollapsed(false);
  }

  // Navigation Logic
  // Use processedCatches for navigation so we navigate within the sorted/filtered list!
  const currentIndex = selectedCatch ? processedCatches.findIndex(c => c.id === selectedCatch.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < processedCatches.length - 1;

  const handlePreviousCatch = () => {
    if (hasPrevious) {
      viewCatch(processedCatches[currentIndex - 1]);
    }
  };

  const handleNextCatch = () => {
    if (hasNext) {
      viewCatch(processedCatches[currentIndex + 1]);
    }
  };

  return (
    <div>
      <h1>Min Fiskelogg 🎣</h1>

      {isFormCollapsed ? (
        <button
          onClick={openNewCatchForm}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.2rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          🎣 Registrera ny fångst
        </button>
      ) : (
        <CatchForm
          onAddCatch={handleAddCatch}
          onUpdateCatch={handleUpdateCatch}
          selectedCatch={selectedCatch}
          isEditing={isEditing}
          onStartEdit={startEditing}
          onCancelEdit={cancelEdit}
          onClose={closeSelection}
          onNext={handleNextCatch}
          onPrevious={handlePreviousCatch}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Laddar fångster...</p>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ margin: 0 }}>Loggbok ({processedCatches.length} fångster)</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setIsCompactView(!isCompactView)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '8px'
                }}
              >
                {isCompactView ? '📄 Detaljerad' : '📝 Kompakt'}
              </button>
              <button
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                style={{
                  backgroundColor: isFilterVisible ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  border: '1px solid var(--color-border)',
                  color: isFilterVisible ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '8px'
                }}
              >
                🔍 {isFilterVisible ? 'Göm filter' : 'Visa filter'}
              </button>
            </div>
          </div>

          {isFilterVisible && (
            <FilterSortBar
              catches={catches}
              filterCriteria={filterCriteria}
              onFilterChange={handleFilterChange}
              sortConfig={sortConfig}
              onSortChange={handleSortChange}
            />
          )}

          <CatchList
            catches={processedCatches}
            onDelete={handleDelete}
            onView={viewCatch}
            isCompact={isCompactView}
          />
        </>
      )}
    </div>
  )
}

export default App
