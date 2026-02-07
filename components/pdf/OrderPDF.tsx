'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { OrderDetailType } from '@/types/orders';

Font.register({
  family: 'Poppins',
  fonts: [
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Poppins',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  company: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  docNumber: {
    fontSize: 9,
    textAlign: 'right',
    color: '#6b7280',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 10,
  },
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    color: '#ffffff',
    fontSize: 8,
    height: 26,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 30,
    alignItems: 'center',
  },
  colCode: { width: '15%', paddingHorizontal: 8 },
  colDesc: { width: '40%', paddingHorizontal: 8 },
  colQty: { width: '15%', paddingHorizontal: 8, textAlign: 'center' },
  colPrice: { width: '15%', paddingHorizontal: 8, textAlign: 'right' },
  colTotal: { width: '15%', paddingHorizontal: 8, textAlign: 'right' },
  totals: {
    alignSelf: 'flex-end',
    width: '40%',
    borderTopWidth: 1,
    borderColor: '#111827',
    paddingTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 9,
    color: '#374151',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingTop: 8,
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
          <View>
            <Text style={styles.company}>iSync</Text>
            <Text style={styles.subtitle}>isynchn.com</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>Cotización</Text>
            <Text style={styles.docNumber}>#{order.docNum}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{order.cardName}</Text>
            <Text style={styles.value}>{order.federalTaxID || 'N/D'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Dirección</Text>
            <Text style={styles.value}>{order.address}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colCode}>Código</Text>
            <Text style={styles.colDesc}>Descripción</Text>
            <Text style={styles.colQty}>Cant.</Text>
            <Text style={styles.colPrice}>Precio</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>

          {order.lines.map(line => (
            <View key={line.itemCode} style={styles.row}>
              <Text style={styles.colCode}>{line.itemCode}</Text>
              <Text style={styles.colDesc}>{line.itemDescription}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colPrice}>
                {line.priceAfterVAT.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.colTotal}>
                {(line.quantity * line.priceAfterVAT).toLocaleString('es-HN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              L. {subtotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ISV (15%)</Text>
            <Text style={styles.totalValue}>
              L. {order.vatSum.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalValue}>Total</Text>
            <Text style={styles.totalValue}>
              L. {order.docTotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Documento generado por iSync · {new Date().toLocaleDateString('es-HN')}
        </Text>
      </Page>
    </Document>
  );
};

export default OrderPDF;
