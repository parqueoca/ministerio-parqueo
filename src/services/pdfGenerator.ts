
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Server, Service, Group, ParkingPosition, Vehicle } from '../types';
import { formatDateDisplay, calculateAge, formatTime12h } from '../utils/formatters';

const MAIN_TITLE = 'MINISTERIO SERVICIO PARQUEO';
const SUB_TITLE = 'CIELOS ABIERTOS';

/**
 * Función para cargar imágenes
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

/**
 * REPORTE DE VEHICULOS
 */
export const generateVehicleReportPDF = async (vehicles: Vehicle[], filterTitle: string = 'Reporte General') => {
  try {
    if (!vehicles || vehicles.length === 0) return false;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const fontSize = 8;
    const cellPadding = 1.5;

    const headers = [['AREA', 'PROPIETARIO', 'PLACA', 'MARCA/MODELO', 'CELULAR']];
    const rows = vehicles.map(v => [
      v.vehiculo_categorias?.nombre || '-',
      v.propietario.toUpperCase(),
      v.placa.toUpperCase(),
      `${v.marca || ''} ${v.modelo || ''}`.trim().toUpperCase(),
      v.celular || '-'
    ]);

    const marginX = 15;
    const tableWidth = pageWidth - (marginX * 2);

    doc.setFillColor(30, 58, 138);
    const bannerHeight = 21;
    doc.rect(marginX, 10, tableWidth, bannerHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(MAIN_TITLE, pageWidth / 2, 14, { align: 'center' });
    doc.text(SUB_TITLE, pageWidth / 2, 17.5, { align: 'center' });
    
    doc.setFontSize(7.5);
    doc.text('CONTROL DE VEHÍCULOS', pageWidth / 2, 22, { align: 'center' });
    
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text(`FILTRO: ${filterTitle.toUpperCase()}`, pageWidth / 2, 26, { align: 'center' });

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 10 + bannerHeight + 2,
      theme: 'grid',
      margin: { left: marginX, right: marginX },
      headStyles: { fillColor: [30, 58, 138], halign: 'center', fontSize: fontSize, cellPadding: cellPadding },
      styles: { fontSize: fontSize, cellPadding: cellPadding, minCellHeight: 0 }
    });

    doc.save(`Reporte_Vehiculos.pdf`);
    return true;
  } catch (e) { return false; }
};

/**
 * REPORTE DE CALENDARIO / AGENDA
 */
export const generateServiceReportPDF = async (services: Service[], groups: Group[]) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const fontSize = 8;
    const cellPadding = 1.5;

    const headers = [['FECHA', 'HORA', 'SERVICIO', 'GRUPO RESPONSABLE']];
    const rows = services.map(s => [
      formatDateDisplay(s.date), 
      formatTime12h(s.arrivalTime), 
      s.name.toUpperCase(), 
      (groups.find(g => g.id === s.groupId)?.name || s.groupId || 'VARIOS').toUpperCase()
    ]);

    const marginX = 15;
    const tableWidth = pageWidth - (marginX * 2);

    doc.setFillColor(37, 99, 235);
    const bannerHeight = 21;
    doc.rect(marginX, 10, tableWidth, bannerHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(MAIN_TITLE, pageWidth / 2, 14, { align: 'center' });
    doc.text(SUB_TITLE, pageWidth / 2, 17.5, { align: 'center' });
    
    doc.setFontSize(7.5);
    doc.text('AGENDA DE SERVICIOS', pageWidth / 2, 22, { align: 'center' });
    
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text(`TOTAL SERVICIOS: ${services.length}`, pageWidth / 2, 26, { align: 'center' });

    autoTable(doc, { 
      head: headers, 
      body: rows, 
      startY: 10 + bannerHeight + 2,
      theme: 'grid',
      margin: { left: marginX, right: marginX },
      headStyles: { fillColor: [37, 99, 235], fontSize: fontSize, cellPadding: cellPadding, halign: 'center' },
      styles: { fontSize: fontSize, cellPadding: cellPadding, minCellHeight: 0 }
    });

    doc.save('Agenda_Servicios.pdf');
    return true;
  } catch (error) { return false; }
};

/**
 * REPORTE DE ASIGNACION / HOJA DE RUTA
 */
export const generateServiceAssignmentPDF = async (service: Service, groups: Group[], positions: ParkingPosition[]) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const fontSize = 9;
    const cellPadding = 1.5;

    const headers = [['COD', 'POSICIÓN', 'SERVIDOR']];
    const rows = service.assignments.map(a => {
      const pos = positions.find(p => p.id === a.positionId);
      let serverName = `${a.servidores?.firstName || ''} ${a.servidores?.lastName || ''}`.trim().toUpperCase();
      
      if (pos?.code === '1') {
        serverName += ' (LIDER)';
      }
      
      return [
        pos?.code || '-',
        (pos?.name || 'ÁREA').toUpperCase(),
        serverName
      ];
    });

    rows.sort((a, b) => String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true }));

    const marginX = 15;
    const tableWidth = pageWidth - (marginX * 2);

    doc.setFillColor(37, 99, 235);
    const bannerHeight = 25;
    doc.rect(marginX, 10, tableWidth, bannerHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(MAIN_TITLE, pageWidth / 2, 14, { align: 'center' });
    doc.text(SUB_TITLE, pageWidth / 2, 17.5, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text(service.name.toUpperCase(), pageWidth / 2, 23, { align: 'center' });
    
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    const groupName = (groups.find(g => g.id === service.groupId)?.name || service.groupId || 'Múltiple').toUpperCase();
    doc.text(`GRUPO: ${groupName} | ${formatDateDisplay(service.date)} | ${formatTime12h(service.arrivalTime)}`, pageWidth / 2, 29, { align: 'center' });

    autoTable(doc, { 
      head: headers, 
      body: rows, 
      startY: 10 + bannerHeight + 2,
      theme: 'grid',
      margin: { left: marginX, right: marginX },
      headStyles: { fillColor: [37, 99, 235], fontSize: fontSize, fontStyle: 'bold', halign: 'center', cellPadding: cellPadding },
      styles: { fontSize: fontSize, cellPadding: cellPadding, minCellHeight: 0 },
      didParseCell: (data) => {
        const code = data.row.cells[0].text[0];
        if (code === '00') data.cell.styles.textColor = [0, 150, 0];
        if (code === '1') data.cell.styles.fontStyle = 'bold';
      }
    });

    doc.save(`Asignacion_${service.name.replace(/\s+/g, '_')}.pdf`);
    return true;
  } catch (error) { return false; }
};

/**
 * REPORTE LISTADO DE SERVIDORES DINAMICO
 */
export const generateServerPDF = async (servers: Server[], selectedColumns: string[], title: string) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Ajuste dinámico de fuente según número de columnas
    const fontSize = selectedColumns.length > 7 ? 6.5 : 8;
    const cellPadding = 1.5;

    // Mapa de nombres legibles para todas las columnas potenciales
    const columnMap: Record<string, string> = {
      'firstName': 'NOMBRE',
      'lastName': 'APELLIDO',
      'cedula': 'CÉDULA',
      'group': 'GRUPO',
      'mobile': 'CELULAR',
      'status': 'ESTATUS',
      'joinDate': 'INGRESO',
      'birthDate': 'NACIMIENTO',
      'bloodType': 'SANGRE',
      'size': 'TALLA',
      'email': 'EMAIL',
      'emergencyContactName': 'CONT. EMERG.'
    };

    const headers = [selectedColumns.map(c => columnMap[c] || c.toUpperCase())];
    const rows = servers.map(s => selectedColumns.map(c => {
      const val = (s as any)[c];
      if (c === 'birthDate' || c === 'joinDate') return formatDateDisplay(val);
      if (c === 'email') return String(val || '-').toLowerCase();
      return String(val || '-').toUpperCase();
    }));

    const marginX = 10;
    const tableWidth = pageWidth - (marginX * 2);

    doc.setFillColor(30, 58, 138);
    const bannerHeight = 22;
    doc.rect(marginX, 10, tableWidth, bannerHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(MAIN_TITLE, pageWidth / 2, 14, { align: 'center' });
    doc.text(SUB_TITLE, pageWidth / 2, 17.5, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text(title.toUpperCase(), pageWidth / 2, 23, { align: 'center' });
    
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`TOTAL RESULTADOS: ${servers.length} | FECHA: ${new Date().toLocaleDateString()}`, pageWidth / 2, 27, { align: 'center' });

    autoTable(doc, { 
      head: headers, 
      body: rows, 
      startY: 10 + bannerHeight + 2,
      theme: 'grid',
      margin: { left: marginX, right: marginX },
      headStyles: { fillColor: [30, 58, 138], fontSize: fontSize, cellPadding: cellPadding, halign: 'center' },
      styles: { 
        fontSize: fontSize - 0.5, 
        cellPadding: cellPadding, 
        minCellHeight: 0, 
        halign: 'center',
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      columnStyles: {
        // Ajuste de anchos para campos comunes si existen
        0: { cellWidth: 25 }, 
        1: { cellWidth: 25 },
        10: { cellWidth: 35 } // Email suele ser más largo
      }
    });

    const fileName = title.toLowerCase().replace(/\s+/g, '_') + '.pdf';
    doc.save(fileName);
    return true;
  } catch (error) { 
    console.error("PDF Export Error:", error);
    return false; 
  }
};

/**
 * FICHA INDIVIDUAL DE SERVIDOR
 */
export const generateSingleServerPDF = async (server: Server) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const margin = 20;

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(MAIN_TITLE, pageWidth / 2, 10, { align: 'center' });
    doc.text(SUB_TITLE, pageWidth / 2, 14, { align: 'center' });

    doc.setFontSize(16);
    const fullName = `${server.firstName || ''} ${server.lastName || ''}`.trim().toUpperCase();
    doc.text(fullName || 'SERVIDOR', pageWidth / 2, 26, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`FICHA TÉCNICA MINISTERIAL | GRUPO: ${(server.group || 'Sin Grupo').toUpperCase()}`, pageWidth / 2, 33, { align: 'center' });

    const photoSize = 25;
    const photoX = pageWidth - margin - photoSize;
    const photoY = 8;
    doc.setFillColor(255, 255, 255);
    doc.rect(photoX - 1, photoY - 1, photoSize + 2, photoSize + 2, 'F');

    if (server.photo) {
      try {
        const img = await loadImage(server.photo);
        doc.addImage(img, 'JPEG', photoX, photoY, photoSize, photoSize);
      } catch (e) {
        doc.setFillColor(240, 240, 240);
        doc.rect(photoX, photoY, photoSize, photoSize, 'F');
      }
    }

    let currentY = 50;

    const drawSection = (title: string, data: [string, any][]) => {
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(title.toUpperCase(), margin, currentY);
      
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.3);
      doc.line(margin, currentY + 1.5, pageWidth - margin, currentY + 1.5);
      
      currentY += 8;
      
      doc.setFontSize(9);
      data.forEach(([label, value]) => {
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, currentY);
        
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'normal');
        const valText = String(value || '-').toUpperCase();
        
        if (valText.length > 50) {
            const splitText = doc.splitTextToSize(valText, 110);
            doc.text(splitText, margin + 50, currentY);
            currentY += (splitText.length * 5);
        } else {
            doc.text(valText, margin + 50, currentY);
            currentY += 6;
        }
      });
      currentY += 4;
    };

    drawSection('Información Personal', [
      ['Cédula:', server.cedula],
      ['Fecha Nacimiento:', `${formatDateDisplay(server.birthDate)} (${calculateAge(server.birthDate)} años)`],
      ['Tipo de Sangre:', server.bloodType],
      ['Celular / WhatsApp:', server.mobile],
      ['Correo Electrónico:', server.email],
      ['Dirección:', server.address]
    ]);

    drawSection('Datos Ministeriales', [
      ['Estatus Actual:', server.status],
      ['Fecha de Ingreso:', formatDateDisplay(server.joinDate)],
      ['Talla de Camisa:', server.size],
      ['Licencia de Conducir:', server.licencia_conducir ? 'SÍ TIENE' : 'NO TIENE']
    ]);

    drawSection('Contacto de Emergencia', [
      ['Nombre Contacto:', server.emergencyContactName],
      ['Parentesco:', server.emergency_contact_relationship],
      ['Teléfono Emergencia:', server.emergencyContactPhone]
    ]);

    if (server.note) {
      drawSection('Observaciones y Notas', [
        ['Notas Adicionales:', server.note]
      ]);
    }

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const generationDate = new Date().toLocaleString();
    doc.text(`Documento generado el: ${generationDate} | Ministerio de Servicio - Parqueo`, pageWidth / 2, 285, { align: 'center' });

    doc.save(`Ficha_${server.firstName || 'Servidor'}.pdf`);
    return true;
  } catch (error) { 
    console.error("Error al generar PDF:", error);
    return false; 
  }
};
