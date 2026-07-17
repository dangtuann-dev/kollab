import { useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export function useExportPDF() {
  const [isExporting, setIsExporting] = useState(false)

  const exportPDF = async (elementId: string, filename: string = 'report') => {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error(`Element with id ${elementId} not found`)
      return
    }

    setIsExporting(true)

    try {
      // Small timeout to allow any layout adjustment to settle
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Options for html2canvas to ensure good quality and support CSS background colors
      const canvas = await html2canvas(element, {
        scale: 2, // higher scale = better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // Filter out elements with 'no-print' class during rendering
        ignoreElements: (el) => el.classList.contains('no-print'),
      })

      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      
      // Page dimensions in mm (A4)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210 // A4 width
      const pageHeight = 297 // A4 height
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = 0

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add extra pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${filename}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return { exportPDF, isExporting }
}

export default useExportPDF
