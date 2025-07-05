import React, { useState } from 'react';

const AddUser = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', role: '' });
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      const updated = [...users];
      updated[editIndex] = form;
      setUsers(updated);
      setEditIndex(null);
    } else {
      setUsers([...users, form]);
    }
    setForm({ name: '', email: '', role: '' });
  };

  const handleEdit = (i) => {
    setForm(users[i]);
    setEditIndex(i);
  };

  const handleDelete = (i) => {
    setUsers(users.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <h3>Add User</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="">-- Select Role --</option>
          <option value="Lecturer">Lecturer</option>
          <option value="CR">Class Representative</option>
          <option value="HOD">Head of Department</option>
        </select>
        <button type="submit">{editIndex !== null ? 'Update' : 'Add'}</button>
      </form>

      <ul>
        {users.map((u, i) => (
          <li key={i}>
            {u.name} - {u.role} ({u.email})
            <button onClick={() => handleEdit(i)}>Edit</button>
            <button onClick={() => handleDelete(i)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddUser;
