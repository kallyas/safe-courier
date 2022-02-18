import React from 'react'
import { Container } from '@mantine/core'

const Layout = ({ children }) => {
  return (
    <Container padding="xl" mt="xl" >
        {children}
    </Container>
  )
}

export default Layout