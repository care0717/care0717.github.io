import { Layout } from '../components/Layout';
import './Sandbox.css';

export default function Sandbox() {
  return (
    <Layout>
      <div className="sandbox">
        <header className="page-header">
          <h1>Sandbox</h1>
          <p className="page-description">個人プロジェクトと実験的なツール</p>
        </header>

        <section className="projects">
          <a href="/sandbox/cube-puzzle-generator/index.html" className="project-card">
            <h3 className="project-title">Cube Puzzle Generator</h3>
            <p className="project-description">
              3Dポリキューブブロックを使ったパズル問題を自動生成するツール
            </p>
            <div className="project-tags">
              <span className="tag">React</span>
              <span className="tag">3D</span>
              <span className="tag">Puzzle</span>
            </div>
          </a>
        </section>
      </div>
    </Layout>
  );
}
