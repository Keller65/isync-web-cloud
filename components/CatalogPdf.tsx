import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

interface Product {
  itemCode: string
  itemName: string
  price: number
}

interface Props {
  products: Product[]
  title: string
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10
  },

  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center"
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },

  card: {
    width: "33%",
    padding: 10,
    border: "1px solid #e5e5e5"
  },

  name: {
    fontSize: 10,
    marginBottom: 4
  },

  code: {
    fontSize: 8,
    color: "gray"
  },

  price: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "bold"
  }
})

export default function CatalogPdf({ products, title }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.grid}>
          {products.map(p => (
            <View key={p.itemCode} style={styles.card}>
              <Text style={styles.code}>{p.itemCode}</Text>
              <Text style={styles.name}>{p.itemName}</Text>
              <Text style={styles.price}>
                L {p.price.toFixed(4)}
              </Text>
            </View>
          ))}
        </View>

      </Page>
    </Document>
  )
}