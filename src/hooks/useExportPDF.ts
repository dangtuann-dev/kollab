import { useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useToast } from '../stores/toastStore'

export function useExportPDF() {
  const [isExporting, setIsExporting] = useState(false)
  const toast = useToast()

  const exportPDF = async (
    target: string | React.RefObject<HTMLElement | null>,
    filename: string = 'bao-cao-kollab'
  ) => {
    let element: HTMLElement | null = null

    if (typeof target === 'string') {
      element = document.getElementById(target)
    } else if (target && 'current' in target) {
      element = target.current
    }

    if (!element) {
      toast.error('Không tìm thấy vùng nội dung cần xuất PDF')
      return
    }

    setIsExporting(true)
    toast.info('Đang khởi tạo và xuất file PDF...')

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        ignoreElements: (el) =>
          el.classList.contains('no-print') || el.classList.contains('print-hide'),
      })

      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const pdf = new jsPDF('p', 'mm', 'a4')

      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${filename}.pdf`)
      toast.success('Xuất báo cáo PDF thành công!')
    } catch (error: any) {
      console.error('Lỗi khi xuất file PDF:', error)
      toast.error(error.message || 'Lỗi khi tạo file PDF báo cáo')
    } finally {
      setIsExporting(false)
    }
  }

  return { exportPDF, isExporting }
}

export default useExportPDF
