import { Link } from 'react-router';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  maxWidth?: 'narrow' | 'wide';
}

export function Layout({ children, maxWidth = 'narrow' }: LayoutProps) {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="site-title">care0717.github.io</Link>
          <nav className="nav">
            <Link to="/blog">Blog</Link>
            <Link to="/sandbox">Sandbox</Link>
            <Link to="/about">About</Link>
          </nav>
        </div>
      </header>

      <main className={`main ${maxWidth}`}>
        {children}
      </main>

      <footer className="footer">
        <p>© 2024 care0717. All rights reserved.</p>
      </footer>
    </div>
  );
}
