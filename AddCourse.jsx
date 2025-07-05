import React, { useState } from 'react';

const AddCourse = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: '', level: '', department: '' });
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      const updated = [...courses];
      updated[editIndex] = form;
      setCourses(updated);
      setEditIndex(null);
    } else {
      setCourses([...courses, form]);
    }
    setForm({ name: '', level: '', department: '' });
  };

  const handleEdit = (i) => {
    setForm(courses[i]);
    setEditIndex(i);
  };

  const handleDelete = (i) => {
    setCourses(courses.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <h3>Add Course</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Course name" />
        <input name="level" value={form.level} onChange={handleChange} placeholder="Level" />
        <input name="department" value={form.department} onChange={handleChange} placeholder="Department" />
        <button type="submit">{editIndex !== null ? 'Update' : 'Add'}</button>
      </form>

      <ul>
        {courses.map((c, i) => (
          <li key={i}>
            {c.name} ({c.level}) - {c.department}
            <button onClick={() => handleEdit(i)}>Edit</button>
            <button onClick={() => handleDelete(i)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddCourse;
