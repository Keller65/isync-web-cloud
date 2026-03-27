'use client';

import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image
} from '@react-pdf/renderer';
import { OrderDetailType } from '@/types/orders';
import LogoImage from "@/public/assets/Agrinsa.png";

const formatMoney = (amount: number) => {
  return amount.toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
    backgroundColor: '#ffffff',
    color: '#000000',
    position: 'relative'
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  logoBox: {
    position: "absolute",
    top: 0,
    left: 10
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  companyInfo: {
    flex: 1,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  companySubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    margin: 2,
  },
  companyDetail: {
    fontSize: 9,
    margin: 1,
    lineHeight: 1.2,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    textTransform: 'uppercase',
  },
  infoTable: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  infoValue: {
    fontSize: 10,
  },
  labelCol: { width: '12%' },
  valueCol: { width: '38%' },
  labelCol2: { width: '15%' },
  valueCol2: { width: '35%' },

  tableArticles: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  thCode: { width: '12%' },
  thDesc: { width: '38%' },
  thCant: { width: '10%', textAlign: 'center' },
  thPU: { width: '12%', textAlign: 'right' },
  thISV: { width: '13%', textAlign: 'right' },
  thTotal: { width: '15%', textAlign: 'right' },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  emptyRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 4,
    height: 24,
  },

  tdCode: { width: '12%', fontSize: 10 },
  tdDesc: { width: '38%', fontSize: 10 },
  tdCant: { width: '10%', fontSize: 10, textAlign: 'center' },
  tdPU: { width: '12%', fontSize: 10, textAlign: 'right' },
  tdISV: { width: '13%', fontSize: 10, textAlign: 'right' },
  tdTotal: { width: '15%', fontSize: 10, textAlign: 'right' },

  footerSection: {
    flexDirection: 'row',
    marginTop: 25,
    justifyContent: 'space-between',
  },
  notesSection: {
    width: '60%',
    fontSize: 9,
  },
  totalsBox: {
    width: '35%',
  },
  totalsTable: {
    width: '100%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsLabel: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  totalsValue: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  totalFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#000',
  },
  totalFinalLabel: {
    fontWeight: 'bold',
    fontSize: 11,
    paddingTop: 4,
  },
  totalFinalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingTop: 4,
  },
  poweredBy: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    fontSize: 8,
    color: '#888888',
    textAlign: 'center',
  },
});

interface OrderPDFProps {
  order: OrderDetailType;
  sellerName?: string;
}

const OrderPDF: React.FC<OrderPDFProps> = ({ order, sellerName = '' }) => {
  const docDate = new Date(order.docDate ?? '').toLocaleDateString('es-HN');

  const subtotal = order.docTotal - order.vatSum;
  const lines = order.lines ?? [];
  const minRows = 8;

  // ✅ corregido
  const getISVPerUnit = (priceNoVAT: number) => priceNoVAT * 0.15;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <View style={styles.logoBox}>
          <Image
            style={styles.logoImage}
            src={LogoImage.src}
          />
        </View>

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>AGRINSA</Text>
            <Text style={styles.companySubtitle}>
              MOTORES AGRO INDUSTRIALES SA DE CV
            </Text>
            <Text style={styles.companyDetail}>
              Principal: Bo. La Guardia, San Pedro Sula, Cortes, 23 Calle, 1 Ave.
            </Text>
            <Text style={styles.companyDetail}>
              Bloque #1 De Los Juzgados De Avenida New Orleans
            </Text>
            <Text style={styles.companyDetail}>
              2 Cuadras Hacia Abajo Izquierda. Honduras, C.A. Tel: (504) 2544-2476
            </Text>
            <Text style={styles.companyDetail}>
              E-mail: contabilidad@agrinsahn.com
            </Text>
            <Text style={styles.companyDetail}>
              <Text style={{ fontWeight: 'bold' }}>
                RTN: 05019995093760
              </Text>
            </Text>
          </View>
        </View>

        <Text style={styles.docTitle}>Cotización</Text>

        {/* INFO */}
        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, styles.labelCol]}>Fecha:</Text>
            <Text style={[styles.infoValue, styles.valueCol]}>{docDate}</Text>

            <Text style={[styles.infoLabel, styles.labelCol2]}>Vendedor:</Text>
            <Text style={[styles.infoValue, styles.valueCol2]}>
              {sellerName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, styles.labelCol]}>Cliente:</Text>
            <Text style={[styles.infoValue, styles.valueCol]}>
              {order.cardName}
            </Text>

            <Text style={[styles.infoLabel, styles.labelCol2]}>
              RTN Cliente:
            </Text>
            <Text style={[styles.infoValue, styles.valueCol2]}>
              {order.federalTaxID}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, styles.labelCol]}>
              N. de Cotización:
            </Text>
            <Text style={[styles.infoValue, styles.valueCol]}>
              {order.docNum}
            </Text>
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.tableArticles}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.thCode]}>Código</Text>
            <Text style={[styles.tableHeaderCell, styles.thDesc]}>Descripción</Text>
            <Text style={[styles.tableHeaderCell, styles.thCant]}>Cant</Text>
            <Text style={[styles.tableHeaderCell, styles.thPU]}>P/U</Text>
            <Text style={[styles.tableHeaderCell, styles.thISV]}>ISV/U</Text>
            <Text style={[styles.tableHeaderCell, styles.thTotal]}>Total</Text>
          </View>

          {lines.map((line, index) => {
            const qty = line.quantity ?? 0;
            const priceNoVAT =
              line.unitPriceNoVAT ??
              line.basePriceNoVAT ??
              line.price ??
              0;

            const isvPerUnit = getISVPerUnit(priceNoVAT);
            const lineTotal = qty * (priceNoVAT * 1.15);

            return (
              <View key={line.itemCode || index} style={styles.tableRow}>
                <Text style={styles.tdCode}>{line.itemCode}</Text>
                <Text style={styles.tdDesc}>{line.itemName}</Text>
                <Text style={styles.tdCant}>{qty.toFixed(2)}</Text>
                <Text style={styles.tdPU}>L{formatMoney(priceNoVAT)}</Text>
                <Text style={styles.tdISV}>L{formatMoney(isvPerUnit)}</Text>
                <Text style={styles.tdTotal}>L{formatMoney(lineTotal)}</Text>
              </View>
            );
          })}

          {lines.length < minRows &&
            Array.from({ length: minRows - lines.length }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.emptyRow} />
            ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footerSection}>
          <View style={styles.notesSection}>
            <Text>
              <Text style={{ fontWeight: 'bold' }}>
                Nota: Vigencia 15 días
              </Text>
            </Text>

            <Text style={{ marginTop: 5 }}>
              <Text style={{ fontWeight: 'bold' }}>Observaciones:</Text>
            </Text>

            <Text>{order.comments}</Text>
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.totalsTable}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total Neto:</Text>
                <Text style={styles.totalsValue}>
                  L{formatMoney(subtotal)}
                </Text>
              </View>

              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Impuesto:</Text>
                <Text style={styles.totalsValue}>
                  L{formatMoney(order.vatSum)}
                </Text>
              </View>

              <View style={styles.totalFinalRow}>
                <Text style={styles.totalFinalLabel}>Total General:</Text>
                <Text style={styles.totalFinalValue}>
                  L{formatMoney(order.docTotal)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.poweredBy}>Powered by iSync Web</Text>
      </Page>
    </Document>
  );
};

export default OrderPDF;