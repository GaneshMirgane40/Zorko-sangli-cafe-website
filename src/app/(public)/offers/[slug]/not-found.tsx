import Link from 'next/link'
import { buttonClasses } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { EmptyState } from '@/components/ui/states'

export default function OfferNotFound() {
  return (
    <main id="main" className="flex-1">
      <Container className="py-space-2xl">
        <EmptyState
          title="This offer isn't available"
          description="It may have ended or been removed."
          action={
            <Link href="/offers" className={buttonClasses({})}>
              See current offers
            </Link>
          }
        />
      </Container>
    </main>
  )
}
