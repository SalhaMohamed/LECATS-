import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterForm.css'; // make sure this file exists in the same folder

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '', // default blank for validation
  });
  const [picture, setPicture] = useState(null);
  const [message, setMessage] = useState({ text: '', isError: false });
  const navigate = useNavigate();

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePictureChange = (e) => {
    setPicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false });

    if (form.role === '') {
      setMessage({ text: 'Please select a role', isError: true });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user', JSON.stringify(form));

      if (picture) {
        formData.append('picture', picture);
      }

      const response = await axios.post(
        'http://localhost:8080/api/user/register',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessage({
        text: 'Registration successful! Redirecting to login...',
        isError: false,
      });

      setTimeout(() => navigate('/login', { replace: true }), 2000);

    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || 'Registration failed';
      setMessage({ text: errorMsg, isError: true });
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>

      {message.text && (
        <div
          className={`message ${message.isError ? 'error' : 'success'}`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-form">
        <label>Full Name:</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleFormChange}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleFormChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleFormChange}
          required
          minLength="8"
        />

        <label>Role:</label>
        <select
          name="role"
          value={form.role}
          onChange={handleFormChange}
          required
        >
          <option value="">-- Select Role --</option>
          <option value="lecturer">Lecturer</option>
          <option value="cr">Class Representative</option>
          <option value="hod">Head of Department</option>
        </select>

        <label>Profile Picture (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePictureChange}
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
