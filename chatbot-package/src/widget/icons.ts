import {
  Bot,
  MessageCircle,
  SendHorizontal,
  UserRound,
  X,
  CheckCircle,
  ArrowLeft,
  createIcons,
} from 'lucide'

export const hydrateIcons = (): void => {
  createIcons({
    icons: {
      Bot,
      MessageCircle,
      SendHorizontal,
      UserRound,
      X,
      CheckCircle,
      ArrowLeft,
    },
  })
}
