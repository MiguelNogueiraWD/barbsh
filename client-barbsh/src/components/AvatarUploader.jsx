import axios from '../api/axiosInstance';
import { useState } from 'react';

export default function AvatarUploader() {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('avatar', file);

    const res = await axios.post('/upload/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    alert("Avatar mis à jour !");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button type="submit">Changer avatar</button>
    </form>
  );
}
