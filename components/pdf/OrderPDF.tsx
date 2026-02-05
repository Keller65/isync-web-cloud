
'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { OrderDetailType } from '@/types/orders';

// Registrar fuentes (asegúrate de que las rutas a las fuentes sean correctas)
// Font.register({
//   family: 'Poppoins',
//   fonts: [
//     { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Poppoins/poppoins-regular-webfont.ttf', fontWeight: 'normal' },
//     { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Poppoins/poppoins-bold-webfont.ttf', fontWeight: 'bold' },
//   ],
// });

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    backgroundColor: '#fff',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#eaeaea',
    paddingBottom: 10,
  },
  headerInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'right',
  },
  documentSubtitle: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#eaeaea',
  },
  customerCol: {
    flexDirection: 'column',
    width: '48%',
  },
  label: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  text: {
    fontSize: 10,
    color: '#333',
  },
  table: {
    width: '100%',
    display: "flex",
    flexDirection: "column",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#d1d1d1',
    alignItems: 'center',
    height: 24,
    // fontStyle: 'bold',
    fontSize: 8,
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#eaeaea',
    alignItems: 'center',
    height: 32,
  },
  tableColDesc: { width: '40%' },
  tableCol: { width: '15%' },
  tableCell: {
    paddingHorizontal: 8,
  },
  textRight: {
    textAlign: 'right',
  },
  textCenter: {
    textAlign: 'center',
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsContainer: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderStyle: 'solid',
    borderColor: '#333',
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTopWidth: 1,
    borderStyle: 'solid',
    borderColor: '#eaeaea',
    paddingTop: 10,
  },
});

interface OrderPDFProps {
  order: OrderDetailType;
}

const OrderPDF: React.FC<OrderPDFProps> = ({ order }) => {
  const subtotal = order.docTotal - order.vatSum;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.companyName}>iSync</Text>
            <Text style={styles.text}>isync.com</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.documentTitle}>Pedido / Cotización</Text>
            <Text style={styles.documentSubtitle}>#{order.docNum}</Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <View style={styles.customerCol}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.text}>{order.cardName}</Text>
            <Text style={styles.text}>{order.federalTaxID || 'N/D'}</Text>
          </View>
          <View style={styles.customerCol}>
            <Text style={styles.label}>Dirección de Entrega</Text>
            <Text style={styles.text}>{order.address}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={[styles.tableCol, styles.tableCell]}><Text>Código</Text></View>
            <View style={[styles.tableColDesc, styles.tableCell]}><Text>Descripción</Text></View>
            <View style={[styles.tableCol, styles.tableCell, styles.textCenter]}><Text>Cant.</Text></View>
            <View style={[styles.tableCol, styles.tableCell, styles.textRight]}><Text>Precio</Text></View>
            <View style={[styles.tableCol, styles.tableCell, styles.textRight]}><Text>Total</Text></View>
          </View>

          {order.lines.map((line) => (
            <View key={line.itemCode} style={styles.tableRow}>
              <View style={[styles.tableCol, styles.tableCell]}>
                <Text>{line.itemCode}</Text>
              </View>
              <View style={[styles.tableColDesc, styles.tableCell]}>
                <Text>{line.itemDescription}</Text>
              </View>
              <View style={[styles.tableCol, styles.tableCell, styles.textCenter]}>
                <Text>{line.quantity}</Text>
              </View>
              <View style={[styles.tableCol, styles.tableCell, styles.textRight]}>
                <Text>{line.priceAfterVAT.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</Text>
              </View>
              <View style={[styles.tableCol, styles.tableCell, styles.textRight]}>
                <Text>{(line.quantity * line.priceAfterVAT).toLocaleString('es-HN', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>L. {subtotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>ISV (15%)</Text>
              <Text style={styles.totalValue}>L. {order.vatSum.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.totalValue}>Total</Text>
              <Text style={styles.totalValue}>L. {order.docTotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.footer}>
          Documento generado por iSync - {new Date().toLocaleDateString('es-HN')}
        </Text>
      </Page>
    </Document>
  );
};

export default OrderPDF;
