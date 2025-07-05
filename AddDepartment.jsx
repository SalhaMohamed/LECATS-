import React, { useState } from 'react';

const AddDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    if (editingIndex !== null) {
      const updated = [...departments];
      updated[editingIndex] = name;
      setDepartments(updated);
      setEditingIndex(null);
    } else {
      setDepartments([...departments, name]);
    }
    setName('');
  };

  const handleDelete = (index) => {
    const updated = departments.filter((_, i) => i !== index);
    setDepartments(updated);
  };

  const handleEdit = (index) => {
    setName(departments[index]);
    setEditingIndex(index);
  };

  return (
    <div>
      <h3>Add Department</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">{editingIndex !== null ? 'Update' : 'Add'}</button>
      </form>

      <ul>
        {departments.map((dept, index) => (
          <li key={index}>
            {dept}
            <button onClick={() => handleEdit(index)}>Edit</button>
            <button onClick={() => handleDelete(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddDepartment;
