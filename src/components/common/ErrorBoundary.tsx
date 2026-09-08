import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
  info?: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for now
    // In production, could send to monitoring endpoint
    // eslint-disable-next-line no-console
    console.error('Uncaught error in React tree:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>앱 오류 발생</h2>
          <p>앱 구성요소 렌더링 중 예외가 발생했습니다. 콘솔 메시지를 확인하거나 페이지를 새로고침 해보세요.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
            <summary>오류 상세 보기</summary>
            <div>
              <strong>Error:</strong>
              <div>{String(this.state.error)}</div>
              <strong>Stack:</strong>
              <div>{this.state.info?.componentStack}</div>
            </div>
          </details>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
