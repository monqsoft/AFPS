'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users2,
  CalendarClock,
  MapPinned,
  Handshake,
  UserPlus,
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-react';

const playerCount = '150+';

export default function HomePage() {
  const router = useRouter();

  const informationCards = [
    {
      title: 'Localização',
      description:
        'Nossa sede está localizada no campo situado na Rua Alto do Verão, em Porto dos Santos, Itaparica, Bahia.',
      icon: <MapPinned className='h-8 w-8 text-primary' />,
      className: 'md:col-span-2',
      content: (
        <div className='mt-4 h-40 rounded-lg bg-muted flex items-center justify-center border'>
          <p className='text-lg text-muted-foreground'>🗺️ Mapa Interativo</p>
        </div>
      ),
    },
    {
      title: 'Jogadores Associados',
      description: `Contamos com uma vibrante comunidade de aproximadamente ${playerCount} jogadores ativos. Junte-se a nós!`,
      icon: <Users2 className='h-8 w-8 text-primary' />,
      className: '',
    },
    {
      title: 'Jogos aos Domingos',
      description:
        'Nossos jogos são realizados aos domingos pela manhã. Venha celebrar a amizade e desfrutar de partidas emocionantes.',
      icon: <CalendarClock className='h-8 w-8 text-primary' />,
      className: '',
    },
    {
      title: 'Comissão Organizadora',
      description:
        'Administrada por Mauricio Porto, Stivie e Bugari. Empenhados em criar um ambiente inclusivo para todos.',
      icon: <Handshake className='h-8 w-8 text-primary' />,
      className: 'md:col-span-1',
    },
    {
      title: 'Pronto para o Time?',
      description:
        'Se você adora futebol, preencha nosso formulário de inscrição e faça parte dessa emocionante jornada esportiva.',
      icon: <UserPlus className='h-8 w-8 text-accent-foreground' />,
      className: 'md:col-span-2 bg-accent text-accent-foreground',
      content: (
        <Button
          size='lg'
          className='mt-4 w-full bg-background hover:bg-background/90 text-foreground text-lg py-3'
          onClick={() => router.push('/cadastro')}
        >
          Inscreva-se Agora
        </Button>
      ),
    },
    {
      title: 'Entre em Contato',
      description:
        'Tem alguma pergunta ou sugestão? Estamos aqui para ajudar. Entre em contato conosco.',
      icon: <MessageSquare className='h-8 w-8 text-primary' />,
      className: '',
      content: (
        <div className='flex justify-center gap-4 mt-4'>
          <Button
            variant='outline'
            size='icon'
            className='hover:bg-primary hover:text-primary-foreground bg-transparent'
          >
            <Facebook className='h-5 w-5' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='hover:bg-primary hover:text-primary-foreground bg-transparent'
          >
            <Instagram className='h-5 w-5' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='hover:bg-primary hover:text-primary-foreground bg-transparent'
          >
            <Twitter className='h-5 w-5' />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground'>
        <div className='absolute inset-0 bg-black/20'></div>
        <div className='relative z-10 text-center max-w-4xl mx-auto px-4'>
          <Image
            src='/logo-afps.png'
            alt='AFPS Logo'
            width={150}
            height={150}
            className='mx-auto mb-8 shadow-2xl rounded-full bg-background p-4'
          />
          <h1 className='text-4xl md:text-6xl font-bold mb-6 text-balance'>
            Bem-vindo à Associação de Futebol de Porto dos Santos
          </h1>
          <p className='text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto text-balance'>
            Unindo paixão, comunidade e tradição no futebol baiano. Faça parte
            da nossa família esportiva.
          </p>
          <Button
            size='lg'
            className='bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-4'
            onClick={() => router.push('/login')}
          >
            Acessar Sistema
          </Button>
        </div>
      </section>

      {/* Information Grid */}
      <section className='py-16 px-4 max-w-7xl mx-auto'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
            Conheça Nossa Associação
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Descubra mais sobre nossa comunidade, atividades e como fazer parte
            do time.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr'>
          {informationCards.map((card, index) => (
            <Card
              key={index}
              className={`${
                card.className
              } transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                card.className?.includes('bg-accent')
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card'
              }`}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center gap-3'>
                  {card.icon}
                  <CardTitle className='text-xl font-semibold'>
                    {card.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <p
                  className={`text-sm mb-4 ${
                    card.className?.includes('bg-accent')
                      ? 'text-accent-foreground/90'
                      : 'text-muted-foreground'
                  }`}
                >
                  {card.description}
                </p>
                {card.content}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-foreground text-background py-12 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <div className='flex items-center justify-center gap-2 mb-6'>
            <Image
              src='/logo-afps.png'
              alt='AFPS Logo'
              width={40}
              height={40}
            />
            <span className='font-bold text-xl'>AFPS</span>
          </div>
          <p className='text-background/80 mb-2'>
            © {new Date().getFullYear()} Associação de Futebol de Porto dos
            Santos. Todos os direitos reservados.
          </p>
          <p className='text-background/70 text-sm'>
            Desenvolvido com ⚽ e paixão pela comunidade.
          </p>
        </div>
      </footer>
    </div>
  );
}
