import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', picturePath: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setForm({
          name: res.data.name || '',
          email: res.data.email || '',
          picturePath: res.data.picturePath || '',
        });
      })
      .catch((err) => console.error(err));
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios
      .put('http://localhost:8080/api/user/update', form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert('Profile updated!');
        setEditMode(false);
        setUser({ ...user, ...form });
      })
      .catch((err) => alert('Failed to update profile'));
  };

  if (!user) return <p>Loading...</p>;

  const profileImg = user.picturePath
    ? `http://localhost:8080${user.picturePath}`
    : 'https://via.placeholder.com/150'; // default image if no profile

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>My Profile</h2>
      <img
        src={profileImg}
        alt="Profile"
        style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          objectFit: 'cover',
          marginBottom: '20px',
        }}
      />

      <div style={{ marginBottom: '15px' }}>
        <label>Full Name:</label>
        {editMode ? (
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        ) : (
          <p>{user.name}</p>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Email:</label>
        {editMode ? (
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        ) : (
          <p>{user.email}</p>
        )}
      </div>

      <div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
