import { Link } from 'react-router';

export default function Sandbox() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Sandbox</h1>
      <Link to="/">← Home</Link>

      <section style={{ marginTop: '2rem' }}>
        <h2>プロジェクト</h2>
        <ul>
          <li>
            <a href="/sandbox/cube-puzzle-generator">Cube Puzzle Generator</a>
          </li>
        </ul>
      </section>
    </div>
  );
}
