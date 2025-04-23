import QRCodeGenerator from './components/QRCodeGenerator'

const App = () => {
  return (
    <div style={{ fontFamily: 'Arial', textAlign: 'center', padding: '2rem' }}>
      <h1>QR Code Generator</h1>
      <QRCodeGenerator />
    </div>
  )
}

export default App
