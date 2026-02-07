import { Layout } from '../components/Layout';
import './About.css';

export default function About() {
  return (
    <Layout>
      <div className="about">
        <header className="page-header">
          <h1>About</h1>
        </header>

        <section className="about-content">
          <h2>whoami</h2>
          <dl className="info-list">
            <div className="info-item">
              <dt>屋号</dt>
              <dd>Tride Tech</dd>
            </div>
            <div className="info-item">
              <dt>名前</dt>
              <dd>浅井 迅馬 (Asai Hayama)</dd>
            </div>
            <div className="info-item">
              <dt>GitHub</dt>
              <dd>
                <a href="https://github.com/care0717" target="_blank" rel="noopener noreferrer">
                  care0717
                </a>
              </dd>
            </div>
            <div className="info-item">
              <dt>Twitter</dt>
              <dd>
                <a href="https://twitter.com/yamaha91122259" target="_blank" rel="noopener noreferrer">
                  @care
                </a>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </Layout>
  );
}
