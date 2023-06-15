import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [guests, setGuests] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const ADMIN_PASSWORD = 'admin';

  useEffect(() => {
    fetchGuests();
  }, []);

  async function fetchGuests() {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/guests');
      const data = await response.json();
      setGuests(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching guests:', error);
      setLoading(false);
    }
  }

  async function handleAddItem() {
    if (inputValue.trim() === '') {
      alert('Please enter a valid guest name');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: inputValue })
      });

      if (!response.ok) {
        throw new Error('Failed to add guest');
      }

      const newGuest = await response.json();
      setGuests([...guests, newGuest]);
      setInputValue('');
      setLoading(false);
    } catch (error) {
      console.error('Error adding guest:', error);
      setLoading(false);
    }
  }

  async function handleRemoveItem(id) {
    if (!isAdmin) {
      alert('You need to be an admin to remove guests.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/guests/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete guest');
      }

      setGuests(guests.filter(guest => guest.id !== id));
      setLoading(false);
    } catch (error) {
      console.error('Error deleting guest:', error);
      setLoading(false);
    }
  }

  async function handleEditItem(id, newName) {
    if (!isAdmin) {
      alert('You need to be an admin to edit guests.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/guests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });

      if (!response.ok) {
        throw new Error('Failed to update guest');
      }

      setGuests(guests.map(guest => (guest.id === id ? { ...guest, name: newName } : guest)));
      setEditMode(false);
      setEditId('');
      setLoading(false);
    } catch (error) {
      console.error('Error updating guest:', error);
      setLoading(false);
    }
  }

  function handleAdminLogin() {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setPassword('');
    } else {
      alert('Invalid admin password');
      setPassword('');
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      if (editMode) {
        handleEditItem(editId, inputValue);
        setEditMode(false);
        setEditId('');
        setInputValue('');
      } else if (inputValue.trim() !== '') {
        handleAddItem();
      } else if (!isAdmin && password.trim() !== '') {
        handleAdminLogin();
      }
    }
  }

  return (
    <div className="app">
      <h1>Guest Book</h1>
      <div className="form-container">
        <input
          type="text"
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter guest name"
        />
        {isAdmin ? (
          <>
            {editMode ? (
              <>
                <button className="edit-button" onClick={() => handleEditItem(editId, inputValue)}>
                  Save
                </button>
                <button className="cancel-button" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="add-button" onClick={handleAddItem}>
                Add
              </button>
            )}
          </>
        ) : (
          <button className="add-button" disabled>
            Add
          </button>
        )}
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="guest-list">
          {guests.map(guest => (
            <li key={guest.id}>
              <div className="guest-details">
                <span>{guest.name}</span>
                {isAdmin && (
                  <div className="button-container">
                    <button
                      className="edit-button"
                      onClick={() => {
                        setEditMode(true);
                        setEditId(guest.id);
                        setInputValue(guest.name);
                      }}
                    >
                      Edit
                    </button>
                    <button className="remove-button" onClick={() => handleRemoveItem(guest.id)}>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {!isAdmin && (
        <div className="admin-login">
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} onKeyPress={handleKeyPress} placeholder="Admin Password" />
          <button className="admin-button" onClick={handleAdminLogin}>
            Login as Admin
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
