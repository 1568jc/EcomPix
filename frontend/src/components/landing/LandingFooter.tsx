import BrandMark from '@/components/BrandMark'

export default function LandingFooter() {
  return (
    <footer className="border-line border-t">
      <div className="text-faint mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs sm:flex-row">
        <BrandMark size="sm">
          <span className="text-muted font-medium">橙宝 AI 修图智能体</span>
        </BrandMark>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <p>为电商运营与内容创作者打造的商品物料工作台</p>
          <a
            href="https://chengbaolog.com/"
            target="_blank"
            rel="noreferrer"
            className="text-brand-strong hover:text-ink shrink-0 transition-colors"
          >
            橙宝官网
          </a>
        </div>
      </div>
    </footer>
  )
}
