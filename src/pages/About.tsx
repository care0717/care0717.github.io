import { Link } from 'react-router';

export default function About() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/">← Home</Link>

      <section style={{ marginTop: '2rem' }}>
        <h1>whoami</h1>
        <ul>
          <li>屋号: Tride Tech</li>
          <li>名前: 浅井 迅馬(Asai Hayama)</li>
          <li>GitHub: <a href="https://github.com/care0717">care0717</a></li>
          <li>Twitter: <a href="https://twitter.com/yamaha91122259">care</a></li>
        </ul>
      </section>
    </div>
  );
}
