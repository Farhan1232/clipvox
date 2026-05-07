import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ImageToPDF from './pages/ImageToPDF'
import VideoCompressor from './pages/VideoCompressor'
import QualityChanger from './pages/QualityChanger'
import AddMusic from './pages/AddMusic'
import BackgroundRemover from './pages/BackgroundRemover'
import ImageEnhancer from './pages/ImageEnhancer'
import VideoToGif from './pages/VideoToGif'
import PdfMerger from './pages/PdfMerger'
import HtmlToPdf from './pages/HtmlToPdf'
import WordToPdf from './pages/WordToPdf'
import PdfToWord from './pages/PdfToWord'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen transition-colors duration-300 overflow-x-hidden">
          <Navbar />
          <Routes>
            <Route path="/"                        element={<Home />} />
            <Route path="/image-to-pdf"            element={<ImageToPDF />} />
            <Route path="/video-compressor"        element={<VideoCompressor />} />
            <Route path="/quality-changer"         element={<QualityChanger />} />
            <Route path="/add-music"               element={<AddMusic />} />
            <Route path="/background-remover"      element={<BackgroundRemover />} />
            <Route path="/image-enhancer"          element={<ImageEnhancer />} />
            <Route path="/video-to-gif"            element={<VideoToGif />} />
            <Route path="/pdf-merger"              element={<PdfMerger />} />
            <Route path="/html-to-pdf"             element={<HtmlToPdf />} />
            <Route path="/word-to-pdf"             element={<WordToPdf />} />
            <Route path="/pdf-to-word"             element={<PdfToWord />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
