export const metadata = {
  title: 'GMB Audit — Internal Tool',
  description: 'Internal GMB audit tool for Rental Marketing Pros',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
