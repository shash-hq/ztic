import {Component} from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true, error};
  }

  componentDidCatch(error, info) {
    console.error('[ZTic ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#FAF9F6',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          textAlign: 'center',
        }}>
        {/* Broken grid mark */}
        <div
          style={{
            marginBottom: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
          <div style={{width: 120, height: 4, background: '#800020'}} />
          <div
            style={{
              width: 80,
              height: 4,
              background: '#1A1C1A',
              alignSelf: 'flex-end',
            }}
          />
          <div style={{width: 100, height: 4, background: '#1A1C1A'}} />
        </div>

        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            background: '#800020',
            color: '#fff',
            padding: '4px 12px',
            display: 'inline-block',
            marginBottom: 24,
          }}>
          System Error
        </span>

        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(40px,8vw,88px)',
            lineHeight: 0.88,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            color: '#1A1C1A',
            marginBottom: 32,
          }}>
          The Grid
          <br />
          <span style={{color: '#800020'}}>Collapsed.</span>
        </h1>

        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 13,
            opacity: 0.5,
            maxWidth: 400,
            lineHeight: 1.75,
            marginBottom: 40,
          }}>
          An unexpected structural failure occurred. The architecture has been
          notified. Please reload to restore the blueprint.
        </p>

        <p
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 10,
            letterSpacing: '0.2em',
            opacity: 0.3,
            textTransform: 'uppercase',
            marginBottom: 32,
            border: '1px solid rgba(26,28,26,0.2)',
            padding: '8px 16px',
            maxWidth: 500,
            wordBreak: 'break-all',
          }}>
          {this.state.error?.message ?? 'Unknown error'}
        </p>

        <button
          onClick={() => window.location.reload()}
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            background: '#1A1C1A',
            color: '#fff',
            border: '2px solid #1A1C1A',
            padding: '16px 40px',
            cursor: 'pointer',
            boxShadow: '4px 4px 0 0 #800020',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translate(2px,2px)';
            e.currentTarget.style.boxShadow = '2px 2px 0 0 #800020';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translate(0,0)';
            e.currentTarget.style.boxShadow = '4px 4px 0 0 #800020';
          }}>
          Reload Blueprint →
        </button>
      </div>
    );
  }
}
