import SideBarBlock from '@/components/layout/sidebar/SideBarBlock'
import Main from '@/components/pages/Main'

export default async function HomePage() {
  return (
    <SideBarBlock>
      <Main />
    </SideBarBlock>
  )
}
