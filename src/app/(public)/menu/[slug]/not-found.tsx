import Link from 'next/link'
import { buttonClasses } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { EmptyState } from '@/components/ui/states'

export default function ItemNotFound() {
  return (
    <main id="main" className="flex-1">
      <Container className="py-space-2xl">
        <EmptyState
          title="This dish isn't on the menu"
          description="It may have been removed or the link is wrong."
          action={
            <Link href="/menu" className={buttonClasses({})}>
              Browse the menu
            </Link>
          }
        />
      </Container>
    </main>
  )
}
