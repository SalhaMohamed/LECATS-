import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LecturerDashboard = () => {
  const [modules, setModules] = useState([]);
  const [excuses, setExcuses] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8080/api/lecturer/modules/today')
      .then(res => setModules(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (id, field, value) => {
    setExcuses(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSubmit = (id) => {
    const formData = new FormData();
    formData.append("comment", excuses[id]?.comment);
    formData.append("file", excuses[id]?.file);
    axios.post(`http://localhost:8080/api/lecturer/excuse/${id}`, formData)
      .then(() => alert("Excuse submitted"))
      .catch(() => alert("Failed"));
  };

  return (
    <div>
      <h2>Lecturer Dashboard <img src={`http://localhost:8080${user.picturePath}`} alt="Profile" />
      </h2>
      {modules.map(m => (
        <div key={m.id}>
          <h4>{m.name} - {m.department}</h4>
          <input type="file" onChange={e => handleChange(m.id, 'file', e.target.files[0])} />
          <textarea onChange={e => handleChange(m.id, 'comment', e.target.value)} placeholder="Excuse comment"></textarea>
          <button onClick={() => handleSubmit(m.id)}>Submit Excuse</button>
        </div>
      ))}
    </div>
  );
};

export default LecturerDashboard;
