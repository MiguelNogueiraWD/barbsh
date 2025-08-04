import axios from '../api/axiosInstance';
import { useEffect, useState } from 'react';

export default function GalleryCoiffeur() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios.get('/gallery').then(res => setImages(res.data));
  }, []);

  const upload = async () => {
    const form = new FormData();
    form.append('image', file);
    const res = await axios.post('/upload/gallery', form);
    setImages([...images, res.data]);
  };

  const remove = async (id) => {
    await axios.delete(`/upload/gallery/${id}`);
    setImages(images.filter(img => img.id !== id));
  };

  return (
    <>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={upload}>Ajouter image</button>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {images.map(img => (
          <div key={img.id}>
            <img src={`http://localhost:3000/uploads/${img.url}`} width="150" />
            <button onClick={() => remove(img.id)}>Supprimer</button>
          </div>
        ))}
      </div>
    </>
  );
}
