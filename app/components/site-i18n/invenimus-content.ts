// app/components/site-i18n/invenimus-content.ts
// Invenimus landing sayfası için TR/EN/DE içerik sözlüğü.
// Locale çerezden (NEXT_LOCALE) türetilir; sunucu bileşeni getServerLocale ile,
// istemci bileşeni useClientLocale ile bu objeyi seçer. Bkz. app/lib/invenimusT.ts.

import type { Locale } from "@/app/lib/i18n-routing";

// ————————————————————————————————————————————————————————————
// Tip: her dil bu şekli doldurmak zorunda → TR/EN/DE drift'i derleme
// anında yakalanır.
// ————————————————————————————————————————————————————————————
export interface InvenimusCopy {
  nav: {
    links: { label: string; href: string }[];
    services: { label: string; children: { label: string; href: string }[] };
    cta: string;
    menuCta: string;
    open: string;
    close: string;
    langLabel: string;
  };
  hero: {
    badge: string;
    titleLead: string;
    titleAccent: string;
    descA: string;
    descStrong: string;
    descB: string;
    ctaPrimary: string;
    ctaSecondary: string;
    techLabel: string;
  };
  stats: { value: string; label: string }[];
  services: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    sub: string;
    items: { title: string; body: string; tag: string }[];
  };
  process: {
    eyebrow: string;
    titleA: string;
    titleAccent: string;
    items: { title: string; body: string }[];
  };
  marketing: {
    eyebrow: string;
    titleA: string;
    titleAccent: string;
    sub: string;
    items: { title: string; body: string; metric: string; metricLabel: string }[];
    cta: string;
  };
  investors: {
    eyebrow: string;
    titleA: string;
    titleAccent: string;
    sub: string;
    steps: { title: string; body: string }[];
    stats: { value: string; label: string }[];
    formTitle: string;
    formSub: string;
    fields: {
      name: string;
      email: string;
      company: string;
      stage: string;
      ticket: string;
      message: string;
      messagePlaceholder: string;
    };
    submit: string;
    submitting: string;
    success: string;
    error: string;
    audience: { founder: string; investor: string };
  };
  ventures: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    link: string;
    tags: string[];
  };
  features: { title: string; body: string }[];
  testimonials: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    items: { quote: string; name: string; role: string }[];
  };
  team: {
    eyebrow: string;
    titleA: string;
    titleAccent: string;
    sub: string;
    members: { name: string; role: string; bio: string }[];
    joinTitle: string;
    joinBody: string;
    joinCta: string;
  };
  faq: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    desc: string;
    items: { q: string; a: string }[];
  };
  contact: {
    badge: string;
    title: string;
    desc: string;
    email: string;
    backToTop: string;
    formName: string;
    formEmail: string;
    formIdea: string;
    formIdeaPlaceholder: string;
    formSubmit: string;
    formSubmitting: string;
    formSuccess: string;
    formError: string;
  };
  footer: {
    tagline: string;
    links: { label: string; href: string }[];
    rights: string;
    location: string;
  };
  auth: {
    backHome: string;
    unexpectedError: string;
    gateHint: string;
    logout: string;
    signInCta: string;
    login: {
      eyebrow: string;
      brandTitle: string;
      brandDesc: string;
      perks: string[];
      formTitle: string;
      formSubtitle: string;
      submit: string;
      submitting: string;
      noAccount: string;
      signUpCta: string;
      required: string;
    };
    register: {
      eyebrow: string;
      brandTitle: string;
      brandDesc: string;
      perks: string[];
      formTitle: string;
      formSubtitle: string;
      submit: string;
      submitting: string;
      haveAccount: string;
      signInCta: string;
      terms: string;
      allRequired: string;
      usernameRule: string;
      invalidEmail: string;
      passwordMin: string;
    };
    fields: {
      username: string;
      usernamePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordHint: string;
      forgotPassword: string;
      show: string;
      hide: string;
    };
  };
}

// ————————————————————————————————————————————————————————————
// Sabitler (dilden bağımsız): teknoloji şeridi, girişim isimleri/renkleri.
// ————————————————————————————————————————————————————————————
export const STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Prisma",
  "AWS",
  "Docker",
  "Kubernetes",
  "OpenAI",
  "Stripe",
];

export const VENTURE_META = [
  { name: "fintra", year: "2025", color: "#d8f34e" },
  { name: "nomad", year: "2025", color: "#f74ea1" },
  { name: "medix", year: "2024", color: "#0b0b0b", ink: "#efefef" },
  { name: "cargoo", year: "2024", color: "#7ae3c3" },
  { name: "lumen", year: "2023", color: "#111827", ink: "#efefef" },
  { name: "verse", year: "2023", color: "#c7b8ff" },
];

export const PROCESS_META = [
  {
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    tint: "#f74ea1",
  },
  {
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    tint: "#d8f34e",
  },
  {
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    tint: "#0b0b0b",
  },
];

// ————————————————————————————————————————————————————————————
// TÜRKÇE
// ————————————————————————————————————————————————————————————
const tr: InvenimusCopy = {
  nav: {
    links: [
      { label: "Çalışmalar", href: "#work" },
      { label: "Studio", href: "#agency" },
      { label: "Pazarlama", href: "#marketing" },
      { label: "Yatırımcılar", href: "#investors" },
      { label: "Kadromuz", href: "#team" },
      { label: "İletişim", href: "#contact" },
    ],
    services: {
      label: "Hizmetler",
      children: [
        { label: "Ürün Keşfi & Strateji", href: "#services" },
        { label: "MVP Mühendisliği", href: "#services" },
        { label: "Yapay Zeka Entegrasyonu", href: "#services" },
      ],
    },
    cta: "Çalışalım",
    menuCta: "Projeni başlat",
    open: "Menüyü aç",
    close: "Menüyü kapat",
    langLabel: "Dil",
  },
  hero: {
    badge: "Venture Studio · 2026 için sıra sınırlı",
    titleLead: "Fikirleri çalışan",
    titleAccent: "ürünlere dönüştürüyoruz.",
    descA:
      "Invenimus; teknoloji ve startup fikirlerini strateji, tasarım ve mühendislikle birleştirip ",
    descStrong: "haftalar içinde yayına alan",
    descB: " bir venture studio'dur.",
    ctaPrimary: "Fikrini anlat",
    ctaSecondary: "Çalışmalarımız",
    techLabel: "Kullandığımız teknolojiler",
  },
  stats: [
    { value: "120+", label: "Yayınlanan ürün" },
    { value: "48M", label: "Toplam kullanıcı erişimi" },
    { value: "9", label: "Ortalama hafta / MVP" },
    { value: "98%", label: "Tekrar çalışma oranı" },
  ],
  services: {
    eyebrow: "NE YAPIYORUZ /",
    titleA: "Fikirden ölçeğe kadar",
    titleB: "tek çatı altında.",
    sub: "Strateji, tasarım, mühendislik ve büyüme — dağınık ekiplerle değil, tek entegre bir takımla.",
    items: [
      {
        title: "Ürün Keşfi & Strateji",
        body: "Fikri; kullanıcı araştırması, pazar analizi ve hızlı prototiplerle test edilebilir bir ürün vizyonuna dönüştürüyoruz.",
        tag: "0–2 hafta",
      },
      {
        title: "MVP Mühendisliği",
        body: "Ölçeklenebilir mimari, temiz kod ve modern altyapıyla ilk çalışan sürümü haftalar içinde yayına alıyoruz.",
        tag: "Full-stack",
      },
      {
        title: "Yapay Zeka Entegrasyonu",
        body: "LLM, RAG ve otomasyon katmanlarını ürünün içine gömerek gerçek iş değeri üreten özellikler kuruyoruz.",
        tag: "AI-native",
      },
      {
        title: "Büyüme & Ölçekleme",
        body: "Analitik, deney altyapısı ve performans optimizasyonuyla ürünü ilk kullanıcıdan milyonlara taşıyoruz.",
        tag: "0 → 1 → n",
      },
      {
        title: "Tasarım Sistemi",
        body: "Marka, arayüz ve mikro-etkileşimleri tek bir ölçeklenebilir tasarım dilinde birleştiriyoruz.",
        tag: "Design ops",
      },
      {
        title: "Güvenlik & Uyum",
        body: "Kimlik doğrulama, ödeme ve veri güvenliğini kurumsal standartlarda baştan doğru kuruyoruz.",
        tag: "Enterprise",
      },
    ],
  },
  process: {
    eyebrow: "NASIL ÇALIŞIYORUZ /",
    titleA: "Üç adımda, sıfırdan",
    titleAccent: "ölçeğe.",
    items: [
      {
        title: "Keşfet",
        body: "Fikri parçalarına ayırıyor, riskleri ve fırsatları haritalayıp net bir yol planı çıkarıyoruz.",
      },
      {
        title: "İnşa Et",
        body: "Tasarım ve mühendislik tek takım halinde çalışır; her hafta dokunulabilir bir sürüm teslim edilir.",
      },
      {
        title: "Büyüt",
        body: "Yayına alır, veriyle öğrenir ve ürünü pazarın gerçek talebine göre hızla iterasyona sokarız.",
      },
    ],
  },
  marketing: {
    eyebrow: "DİJİTAL PAZARLAMA /",
    titleA: "Ürünü kurmak yetmez —",
    titleAccent: "onu duyuran motoru da kuruyoruz.",
    sub: "Performans pazarlaması, içerik ve marka; tahmine değil, veriye çalışan tek bir büyüme makinesinde birleşir. İlk kullanıcıdan ölçekli talebe kadar volanı biz döndürürüz.",
    items: [
      {
        title: "Performans Pazarlaması",
        body: "Google, Meta ve TikTok'ta her kuruşu ROAS'a çeviren, günlük optimize edilen kampanyalar kurarız.",
        metric: "4.2x",
        metricLabel: "ort. ROAS",
      },
      {
        title: "SEO & İçerik Motoru",
        body: "Arama niyetini gelire çeviren teknik SEO ve içerik sistemiyle organik trafiği bileşik büyütürüz.",
        metric: "+180%",
        metricLabel: "organik trafik / 6 ay",
      },
      {
        title: "Marka & Konumlandırma",
        body: "Rakiplerin arasından sıyrılan bir hikâye, ses tonu ve görsel dil; akılda kalan bir marka inşa ederiz.",
        metric: "1 gün",
        metricLabel: "marka sprint",
      },
      {
        title: "Dönüşüm & CRO",
        body: "Landing, funnel ve fiyatlandırmayı A/B testlerle keskinleştirir, aynı trafikten daha çok gelir çıkarırız.",
        metric: "+63%",
        metricLabel: "dönüşüm artışı",
      },
      {
        title: "Yaşam Döngüsü & CRM",
        body: "E-posta, push ve otomasyonla ilk satın almayı sadakate, sadakati tekrar gelire çeviririz.",
        metric: "3.4x",
        metricLabel: "LTV artışı",
      },
      {
        title: "Analitik & Attribution",
        body: "Her kanalı tek panelde ölçer, büyümenin gerçekten nereden geldiğini net biçimde gösteririz.",
        metric: "0 kör nokta",
        metricLabel: "tam görünürlük",
      },
    ],
    cta: "Büyüme planını konuşalım",
  },
  investors: {
    eyebrow: "YATIRIMCILARLA BULUŞTURMA /",
    titleA: "Doğru sermaye,",
    titleAccent: "doğru masada.",
    sub: "İyi bir ürün, sessizce büyümek zorunda değil. Yatırıma hazır girişimleri; melek yatırımcı, VC ve stratejik ortaklardan oluşan ağımızla eşleştirir, masaya doğru hikâyeyle oturmanı sağlarız.",
    steps: [
      {
        title: "Hazırlık & Değerleme",
        body: "Metrikleri, anlatıyı ve data room'u yatırımcıların ilk bakışta 'evet' diyeceği hâle getiririz.",
      },
      {
        title: "Doğru Eşleşme",
        body: "300+ yatırımcılık ağımızdan; tez, evre ve sektörüne göre gerçekten uygun isimlerle tanıştırırız.",
      },
      {
        title: "Pitch & Kapanış",
        body: "Sunumdan term sheet'e kadar yanında dururuz; müzakere ve due diligence'ı birlikte yürütürüz.",
      },
    ],
    stats: [
      { value: "300+", label: "Aktif yatırımcı ağı" },
      { value: "€64M", label: "Yönlendirilen sermaye" },
      { value: "40+", label: "Kapanan tur" },
    ],
    formTitle: "Eşleşme başvurusu",
    formSub: "Kurucuysan sermaye arıyorsun, yatırımcıysan fırsat. Formu doldur, 48 saat içinde dönelim.",
    fields: {
      name: "Ad Soyad",
      email: "E-posta",
      company: "Girişim / Fon adı",
      stage: "Evre",
      ticket: "Tur / bilet büyüklüğü",
      message: "Kısaca anlat",
      messagePlaceholder: "Ne yapıyorsun, ne arıyorsun?",
    },
    submit: "Başvuruyu gönder",
    submitting: "Gönderiliyor…",
    success: "Başvurun bize ulaştı. En kısa sürede dönüyoruz.",
    error: "Bir hata oluştu. Lütfen tekrar dene.",
    audience: { founder: "Kurucuyum, sermaye arıyorum", investor: "Yatırımcıyım, fırsat arıyorum" },
  },
  ventures: {
    eyebrow: "PORTFÖY /",
    titleA: "Hayata geçirdiğimiz",
    titleB: "girişimler.",
    link: "Sıradaki senin olabilir",
    tags: [
      "Fintech · Ödeme altyapısı",
      "SaaS · Uzaktan ekipler",
      "HealthTech · AI teşhis",
      "Lojistik · Optimizasyon",
      "EnerjiTech · IoT",
      "Yapay zeka · Üretken içerik",
    ],
  },
  features: [
    {
      title: "Hız takıntısı",
      body: "İlk çalışan sürüm haftalarla ölçülür, aylarla değil. Her hafta gerçek ilerleme görürsün.",
    },
    {
      title: "Ürün + kurucu zihniyeti",
      body: "Sadece kod yazmıyoruz; işini, kullanıcını ve büyüme motorunu birlikte tasarlıyoruz.",
    },
    {
      title: "Ölçeğe hazır mimari",
      body: "İlk kullanıcı için de milyonuncu kullanıcı için de aynı sağlam temeli kuruyoruz.",
    },
  ],
  testimonials: {
    eyebrow: "KURUCULAR NE DİYOR /",
    titleA: "Birlikte kurduğumuz",
    titleB: "hikâyeler.",
    items: [
      {
        quote:
          "Fikirden yayınlanan ürüne 9 haftada ulaştık. Invenimus bir ajans değil, gerçek bir kurucu ortak gibi çalıştı.",
        name: "Elif Demir",
        role: "Kurucu, Fintra",
      },
      {
        quote:
          "Yapay zeka özelliklerimizi onlar kurdu ve dönüşüm oranımız iki katına çıktı. Mühendislik kalitesi olağanüstü.",
        name: "Marco Rossi",
        role: "CTO, Nomad",
      },
      {
        quote:
          "İlk yatırım turumuzu onların hazırladığı prototiple kapattık. Hız ve titizlik nadiren bir arada olur.",
        name: "Aylin Kaya",
        role: "CEO, Medix",
      },
      {
        quote:
          "Ölçeklenme sancılarımızı 3 ayda çözdüler. Altyapımız artık 10 kat trafiği gülerek kaldırıyor.",
        name: "James Park",
        role: "VP Eng, Cargoo",
      },
    ],
  },
  team: {
    eyebrow: "KADROMUZ /",
    titleA: "Fikrini emanet edeceğin",
    titleAccent: "ekip.",
    sub: "Strateji, tasarım, mühendislik ve büyümeyi tek çatı altında toplayan; onlarca ürünü sıfırdan ölçeğe taşımış bir kadro.",
    members: [
      {
        name: "Deniz Aydın",
        role: "Kurucu & Ürün",
        bio: "İki exit'li kurucu. Fikri stratejiye, stratejiyi yol haritasına çevirir.",
      },
      {
        name: "Selin Yılmaz",
        role: "Tasarım Direktörü",
        bio: "Marka ve arayüzü tek dilde birleştirir; ödüllü ürün deneyimleri kurar.",
      },
      {
        name: "Emre Koç",
        role: "Baş Mühendis",
        bio: "Ölçeğe hazır mimarinin sahibi. Haftalar içinde yayına, sorunsuz büyümeye.",
      },
      {
        name: "Aylin Şahin",
        role: "Yapay Zeka Lideri",
        bio: "LLM ve RAG katmanlarını gerçek iş değerine çeviren AI mühendisi.",
      },
      {
        name: "Can Erdoğan",
        role: "Büyüme Direktörü",
        bio: "Performans pazarlaması ve CRO ile ilk kullanıcıdan milyonlara volanı döndürür.",
      },
      {
        name: "Zeynep Arı",
        role: "Yatırımcı İlişkileri",
        bio: "300+ yatırımcılık ağın mimarı; girişimleri doğru masayla buluşturur.",
      },
    ],
    joinTitle: "Aramıza katıl",
    joinBody: "Sıra dışı ürünler kuran bir ekip arıyorsan, tanışalım.",
    joinCta: "Açık pozisyonlar",
  },
  faq: {
    eyebrow: "SSS /",
    titleA: "Aklındaki",
    titleB: "sorular.",
    desc: "Cevabını bulamadın mı? Bize yazman yeterli — 24 saat içinde dönüyoruz.",
    items: [
      {
        q: "Sadece bir fikrim var, koda hiç dokunmadım. Yine de çalışır mıyız?",
        a: "Kesinlikle. Çoğu ortağımız yola bir sunum veya bir cümlelik fikirle çıkıyor. Keşif aşamasında birlikte vizyonu netleştirip yol haritasına dönüştürüyoruz.",
      },
      {
        q: "Bir MVP ne kadar sürede yayına girer?",
        a: "Kapsama göre değişse de tipik olarak 6–10 hafta içinde gerçek kullanıcıların kullanabileceği çalışan bir sürüm teslim ediyoruz.",
      },
      {
        q: "Kodun ve ürünün sahipliği kimde olur?",
        a: "Tamamı sizde. Tüm kaynak kodu, tasarım dosyaları ve altyapı ilk günden itibaren sizin mülkiyetinizdedir. İsterseniz ekibinize eksiksiz devir yaparız.",
      },
      {
        q: "Ekibinizle nasıl fiyatlandırıyorsunuz?",
        a: "Sabit kapsamlı proje, aylık retainer ve bazı seçili girişimler için hisse + nakit karması modelleri sunuyoruz. İlk görüşmede size en uygun modeli birlikte seçiyoruz.",
      },
      {
        q: "Yayından sonra desteğe devam ediyor musunuz?",
        a: "Evet. Büyüme aşamasında yanınızdayız: yeni özellikler, ölçekleme, performans ve ekibinizin işe alımına kadar destek veriyoruz.",
      },
    ],
  },
  contact: {
    badge: "Hadi başlayalım",
    title: "Bir fikrin mi var?",
    desc: "Aklındaki fikri 12 aya kalmadan gerçek kullanıcıların kullandığı bir ürüne dönüştürelim. İlk görüşme ücretsiz.",
    email: "hello@invenimus.studio",
    backToTop: "Başa dön",
    formName: "Ad Soyad",
    formEmail: "E-posta",
    formIdea: "Fikrin",
    formIdeaPlaceholder: "Aklındaki fikri birkaç cümleyle anlat…",
    formSubmit: "Fikrini gönder",
    formSubmitting: "Gönderiliyor…",
    formSuccess: "Fikrin bize ulaştı! 24 saat içinde dönüyoruz.",
    formError: "Bir hata oluştu. Lütfen tekrar dene.",
  },
  footer: {
    tagline: "Teknoloji & startup fikirlerini hayata geçiren venture studio.",
    links: [
      { label: "Hizmetler", href: "#services" },
      { label: "Pazarlama", href: "#marketing" },
      { label: "Yatırımcılar", href: "#investors" },
      { label: "Kadromuz", href: "#team" },
      { label: "İletişim", href: "#contact" },
    ],
    rights: "Invenimus. İstanbul — Berlin.",
    location: "İstanbul — Berlin",
  },
  auth: {
    backHome: "← Ana sayfaya dön",
    unexpectedError: "Beklenmeyen bir hata oluştu.",
    gateHint: "Göndermek için giriş yapman gerekir — formu doldur, seni girişe yönlendirelim.",
    logout: "Çıkış yap",
    signInCta: "Giriş yap",
    login: {
      eyebrow: "Tekrar hoş geldin",
      brandTitle: "Fikirler burada çalışan ürünlere dönüşür.",
      brandDesc:
        "Hesabına giriş yap; projelerini takip et, ekibinle çalış ve fikrini bir sonraki aşamaya taşı.",
      perks: [
        "Proje ve başvuru takibi",
        "Ekip ve yatırımcı erişimi",
        "Tek panelden yönetim",
      ],
      formTitle: "Giriş yap",
      formSubtitle: "Hesabına erişmek için bilgilerini gir.",
      submit: "Giriş yap",
      submitting: "Giriş yapılıyor…",
      noAccount: "Hesabın yok mu?",
      signUpCta: "Üye ol",
      required: "Kullanıcı adı ve şifre zorunludur.",
    },
    register: {
      eyebrow: "Aramıza katıl",
      brandTitle: "Bir sonraki girişim seninki olabilir.",
      brandDesc:
        "Ücretsiz hesabını oluştur; fikrini paylaş, sürecini takip et ve Invenimus ekosistemine katıl.",
      perks: [
        "Dakikalar içinde kurulum",
        "Fikrini doğrudan ekibe ulaştır",
        "Güncelleme ve fırsatlardan ilk sen haberdar ol",
      ],
      formTitle: "Üye ol",
      formSubtitle: "Birkaç saniyede ücretsiz hesabını oluştur.",
      submit: "Hesap oluştur",
      submitting: "Hesap oluşturuluyor…",
      haveAccount: "Zaten hesabın var mı?",
      signInCta: "Giriş yap",
      terms: "Üye olarak kullanım koşullarını kabul etmiş sayılırsın.",
      allRequired: "Tüm alanlar zorunludur.",
      usernameRule: "Kullanıcı adı yalnızca harf, rakam, - ve _ içerebilir.",
      invalidEmail: "Geçerli bir e-posta girin.",
      passwordMin: "Şifre en az 8 karakter olmalı.",
    },
    fields: {
      username: "Kullanıcı adı",
      usernamePlaceholder: "kullaniciadi",
      email: "E-posta",
      emailPlaceholder: "ornek@eposta.com",
      password: "Şifre",
      passwordHint: "En az 8 karakter",
      forgotPassword: "Şifremi unuttum",
      show: "Göster",
      hide: "Gizle",
    },
  },
};

// ————————————————————————————————————————————————————————————
// İNGİLİZCE
// ————————————————————————————————————————————————————————————
const en: InvenimusCopy = {
  nav: {
    links: [
      { label: "Work", href: "#work" },
      { label: "Studio", href: "#agency" },
      { label: "Marketing", href: "#marketing" },
      { label: "Investors", href: "#investors" },
      { label: "Team", href: "#team" },
      { label: "Contact", href: "#contact" },
    ],
    services: {
      label: "Services",
      children: [
        { label: "Product Discovery & Strategy", href: "#services" },
        { label: "MVP Engineering", href: "#services" },
        { label: "AI Integration", href: "#services" },
      ],
    },
    cta: "Let's talk",
    menuCta: "Start your project",
    open: "Open menu",
    close: "Close menu",
    langLabel: "Language",
  },
  hero: {
    badge: "Venture Studio · Limited slots for 2026",
    titleLead: "We turn ideas into",
    titleAccent: "products that ship.",
    descA:
      "Invenimus is a venture studio that blends strategy, design and engineering to take technology and startup ideas ",
    descStrong: "live in a matter of weeks",
    descB: ".",
    ctaPrimary: "Pitch your idea",
    ctaSecondary: "Our work",
    techLabel: "Technologies we use",
  },
  stats: [
    { value: "120+", label: "Products shipped" },
    { value: "48M", label: "Total user reach" },
    { value: "9", label: "Avg. weeks / MVP" },
    { value: "98%", label: "Repeat engagement" },
  ],
  services: {
    eyebrow: "WHAT WE DO /",
    titleA: "From idea to scale,",
    titleB: "under one roof.",
    sub: "Strategy, design, engineering and growth — not scattered teams, but a single integrated one.",
    items: [
      {
        title: "Product Discovery & Strategy",
        body: "We turn the idea into a testable product vision through user research, market analysis and rapid prototypes.",
        tag: "0–2 weeks",
      },
      {
        title: "MVP Engineering",
        body: "With scalable architecture, clean code and modern infrastructure, we ship the first working version in weeks.",
        tag: "Full-stack",
      },
      {
        title: "AI Integration",
        body: "We embed LLM, RAG and automation layers into the product to build features that create real business value.",
        tag: "AI-native",
      },
      {
        title: "Growth & Scaling",
        body: "With analytics, experimentation and performance optimization we take the product from first user to millions.",
        tag: "0 → 1 → n",
      },
      {
        title: "Design System",
        body: "We unify brand, interface and micro-interactions into one scalable design language.",
        tag: "Design ops",
      },
      {
        title: "Security & Compliance",
        body: "We build authentication, payments and data security right from day one, to enterprise standards.",
        tag: "Enterprise",
      },
    ],
  },
  process: {
    eyebrow: "HOW WE WORK /",
    titleA: "In three steps, from zero",
    titleAccent: "to scale.",
    items: [
      {
        title: "Discover",
        body: "We break the idea into pieces, map risks and opportunities, and produce a clear roadmap.",
      },
      {
        title: "Build",
        body: "Design and engineering work as one team; every week a tangible version is delivered.",
      },
      {
        title: "Grow",
        body: "We ship, learn from data, and rapidly iterate the product against real market demand.",
      },
    ],
  },
  marketing: {
    eyebrow: "DIGITAL MARKETING /",
    titleA: "Building the product isn't enough —",
    titleAccent: "we build the engine that gets it heard.",
    sub: "Performance marketing, content and brand converge into a single growth machine that runs on data, not guesswork. From first user to demand at scale, we keep the flywheel spinning.",
    items: [
      {
        title: "Performance Marketing",
        body: "We run daily-optimized campaigns across Google, Meta and TikTok that turn every cent into ROAS.",
        metric: "4.2x",
        metricLabel: "avg. ROAS",
      },
      {
        title: "SEO & Content Engine",
        body: "We compound organic traffic with a technical SEO and content system that turns search intent into revenue.",
        metric: "+180%",
        metricLabel: "organic traffic / 6 mo",
      },
      {
        title: "Brand & Positioning",
        body: "A story, tone of voice and visual language that cut through the noise — a brand people remember.",
        metric: "1 day",
        metricLabel: "brand sprint",
      },
      {
        title: "Conversion & CRO",
        body: "We sharpen landing, funnel and pricing with A/B tests, pulling more revenue from the same traffic.",
        metric: "+63%",
        metricLabel: "conversion lift",
      },
      {
        title: "Lifecycle & CRM",
        body: "With email, push and automation we turn the first purchase into loyalty, and loyalty into repeat revenue.",
        metric: "3.4x",
        metricLabel: "LTV increase",
      },
      {
        title: "Analytics & Attribution",
        body: "We measure every channel in one dashboard and show exactly where growth really comes from.",
        metric: "0 blind spots",
        metricLabel: "full visibility",
      },
    ],
    cta: "Let's talk growth",
  },
  investors: {
    eyebrow: "INVESTOR MATCHING /",
    titleA: "The right capital,",
    titleAccent: "at the right table.",
    sub: "A great product doesn't have to grow in silence. We match investment-ready startups with our network of angels, VCs and strategic partners — and get you to the table with the right story.",
    steps: [
      {
        title: "Prep & Valuation",
        body: "We shape your metrics, narrative and data room into something investors say 'yes' to at first glance.",
      },
      {
        title: "The Right Match",
        body: "From our 300+ investor network we introduce names that genuinely fit your thesis, stage and sector.",
      },
      {
        title: "Pitch & Close",
        body: "From deck to term sheet we stand by you; we run negotiation and due diligence together.",
      },
    ],
    stats: [
      { value: "300+", label: "Active investor network" },
      { value: "€64M", label: "Capital routed" },
      { value: "40+", label: "Rounds closed" },
    ],
    formTitle: "Matching application",
    formSub: "If you're a founder you're raising, if you're an investor you're sourcing. Fill the form and we'll get back within 48 hours.",
    fields: {
      name: "Full name",
      email: "Email",
      company: "Startup / fund name",
      stage: "Stage",
      ticket: "Round / ticket size",
      message: "Tell us briefly",
      messagePlaceholder: "What are you building, what are you looking for?",
    },
    submit: "Send application",
    submitting: "Sending…",
    success: "Your application reached us. We'll be in touch shortly.",
    error: "Something went wrong. Please try again.",
    audience: { founder: "I'm a founder, raising capital", investor: "I'm an investor, sourcing deals" },
  },
  ventures: {
    eyebrow: "PORTFOLIO /",
    titleA: "The ventures",
    titleB: "we brought to life.",
    link: "Yours could be next",
    tags: [
      "Fintech · Payment infrastructure",
      "SaaS · Remote teams",
      "HealthTech · AI diagnosis",
      "Logistics · Optimization",
      "EnergyTech · IoT",
      "AI · Generative content",
    ],
  },
  features: [
    {
      title: "Obsessed with speed",
      body: "The first working version is measured in weeks, not months. You see real progress every week.",
    },
    {
      title: "Product + founder mindset",
      body: "We don't just write code; we design your business, your user and your growth engine together.",
    },
    {
      title: "Scale-ready architecture",
      body: "We build the same solid foundation for the first user and the millionth alike.",
    },
  ],
  testimonials: {
    eyebrow: "WHAT FOUNDERS SAY /",
    titleA: "The stories",
    titleB: "we built together.",
    items: [
      {
        quote:
          "We went from idea to a shipped product in 9 weeks. Invenimus worked like a real co-founder, not an agency.",
        name: "Elif Demir",
        role: "Founder, Fintra",
      },
      {
        quote:
          "They built our AI features and our conversion rate doubled. The engineering quality is outstanding.",
        name: "Marco Rossi",
        role: "CTO, Nomad",
      },
      {
        quote:
          "We closed our first round with the prototype they built. Speed and rigor rarely come together.",
        name: "Aylin Kaya",
        role: "CEO, Medix",
      },
      {
        quote:
          "They solved our scaling pains in 3 months. Our infrastructure now handles 10x traffic with a smile.",
        name: "James Park",
        role: "VP Eng, Cargoo",
      },
    ],
  },
  team: {
    eyebrow: "OUR TEAM /",
    titleA: "The team you'd trust",
    titleAccent: "with your idea.",
    sub: "A crew that brings strategy, design, engineering and growth under one roof — and has taken dozens of products from zero to scale.",
    members: [
      {
        name: "Deniz Aydın",
        role: "Founder & Product",
        bio: "Two-time exited founder. Turns ideas into strategy, strategy into roadmap.",
      },
      {
        name: "Selin Yılmaz",
        role: "Design Director",
        bio: "Unifies brand and interface into one language; builds award-winning product experiences.",
      },
      {
        name: "Emre Koç",
        role: "Principal Engineer",
        bio: "Owner of scale-ready architecture. Live in weeks, smooth growth after.",
      },
      {
        name: "Aylin Şahin",
        role: "Head of AI",
        bio: "AI engineer turning LLM and RAG layers into real business value.",
      },
      {
        name: "Can Erdoğan",
        role: "Head of Growth",
        bio: "Spins the flywheel from first user to millions with performance marketing and CRO.",
      },
      {
        name: "Zeynep Arı",
        role: "Investor Relations",
        bio: "Architect of the 300+ investor network; connects startups to the right table.",
      },
    ],
    joinTitle: "Join us",
    joinBody: "If you're looking for a team that builds extraordinary products, let's talk.",
    joinCta: "Open roles",
  },
  faq: {
    eyebrow: "FAQ /",
    titleA: "Questions",
    titleB: "on your mind.",
    desc: "Couldn't find your answer? Just write to us — we reply within 24 hours.",
    items: [
      {
        q: "I only have an idea and never touched code. Can we still work together?",
        a: "Absolutely. Most of our partners start with a deck or a one-sentence idea. In discovery we clarify the vision together and turn it into a roadmap.",
      },
      {
        q: "How long until an MVP goes live?",
        a: "It depends on scope, but typically we ship a working version real users can use within 6–10 weeks.",
      },
      {
        q: "Who owns the code and the product?",
        a: "All of it is yours. All source code, design files and infrastructure are your property from day one. If you like, we do a full handover to your team.",
      },
      {
        q: "How do you price your work?",
        a: "We offer fixed-scope projects, monthly retainers, and for select ventures an equity + cash blend. In the first call we pick the best model together.",
      },
      {
        q: "Do you keep supporting after launch?",
        a: "Yes. We're with you through growth: new features, scaling, performance, and even hiring your team.",
      },
    ],
  },
  contact: {
    badge: "Let's get started",
    title: "Got an idea?",
    desc: "Let's turn the idea on your mind into a product real users use in under 12 months. The first call is free.",
    email: "hello@invenimus.studio",
    backToTop: "Back to top",
    formName: "Full name",
    formEmail: "Email",
    formIdea: "Your idea",
    formIdeaPlaceholder: "Describe the idea on your mind in a few sentences…",
    formSubmit: "Send your idea",
    formSubmitting: "Sending…",
    formSuccess: "Your idea reached us! We'll be in touch within 24 hours.",
    formError: "Something went wrong. Please try again.",
  },
  footer: {
    tagline: "A venture studio bringing technology & startup ideas to life.",
    links: [
      { label: "Services", href: "#services" },
      { label: "Marketing", href: "#marketing" },
      { label: "Investors", href: "#investors" },
      { label: "Team", href: "#team" },
      { label: "Contact", href: "#contact" },
    ],
    rights: "Invenimus. Istanbul — Berlin.",
    location: "Istanbul — Berlin",
  },
  auth: {
    backHome: "← Back to home",
    unexpectedError: "An unexpected error occurred.",
    gateHint: "You need to sign in to submit — fill the form and we'll take you to login.",
    logout: "Log out",
    signInCta: "Sign in",
    login: {
      eyebrow: "Welcome back",
      brandTitle: "Where ideas turn into products that ship.",
      brandDesc:
        "Sign in to your account; track your projects, work with your team and take your idea to the next stage.",
      perks: [
        "Project & application tracking",
        "Team & investor access",
        "One dashboard to manage it all",
      ],
      formTitle: "Sign in",
      formSubtitle: "Enter your details to access your account.",
      submit: "Sign in",
      submitting: "Signing in…",
      noAccount: "Don't have an account?",
      signUpCta: "Sign up",
      required: "Username and password are required.",
    },
    register: {
      eyebrow: "Join us",
      brandTitle: "The next venture could be yours.",
      brandDesc:
        "Create your free account; share your idea, track your progress and join the Invenimus ecosystem.",
      perks: [
        "Set up in minutes",
        "Get your idea straight to the team",
        "Be first to hear about updates & opportunities",
      ],
      formTitle: "Sign up",
      formSubtitle: "Create your free account in seconds.",
      submit: "Create account",
      submitting: "Creating account…",
      haveAccount: "Already have an account?",
      signInCta: "Sign in",
      terms: "By signing up, you agree to the terms of use.",
      allRequired: "All fields are required.",
      usernameRule: "Username may only contain letters, numbers, - and _.",
      invalidEmail: "Enter a valid email.",
      passwordMin: "Password must be at least 8 characters.",
    },
    fields: {
      username: "Username",
      usernamePlaceholder: "username",
      email: "Email",
      emailPlaceholder: "you@email.com",
      password: "Password",
      passwordHint: "At least 8 characters",
      forgotPassword: "Forgot password",
      show: "Show",
      hide: "Hide",
    },
  },
};

// ————————————————————————————————————————————————————————————
// ALMANCA
// ————————————————————————————————————————————————————————————
const de: InvenimusCopy = {
  nav: {
    links: [
      { label: "Arbeiten", href: "#work" },
      { label: "Studio", href: "#agency" },
      { label: "Marketing", href: "#marketing" },
      { label: "Investoren", href: "#investors" },
      { label: "Team", href: "#team" },
      { label: "Kontakt", href: "#contact" },
    ],
    services: {
      label: "Leistungen",
      children: [
        { label: "Produktentdeckung & Strategie", href: "#services" },
        { label: "MVP-Engineering", href: "#services" },
        { label: "KI-Integration", href: "#services" },
      ],
    },
    cta: "Sprechen wir",
    menuCta: "Projekt starten",
    open: "Menü öffnen",
    close: "Menü schließen",
    langLabel: "Sprache",
  },
  hero: {
    badge: "Venture Studio · Begrenzte Plätze für 2026",
    titleLead: "Wir machen aus Ideen",
    titleAccent: "Produkte, die live gehen.",
    descA:
      "Invenimus ist ein Venture Studio, das Strategie, Design und Engineering vereint, um Technologie- und Startup-Ideen ",
    descStrong: "innerhalb von Wochen live zu bringen",
    descB: ".",
    ctaPrimary: "Idee vorstellen",
    ctaSecondary: "Unsere Arbeiten",
    techLabel: "Von uns eingesetzte Technologien",
  },
  stats: [
    { value: "120+", label: "Veröffentlichte Produkte" },
    { value: "48M", label: "Gesamte Nutzerreichweite" },
    { value: "9", label: "Ø Wochen / MVP" },
    { value: "98%", label: "Wiederkehrende Zusammenarbeit" },
  ],
  services: {
    eyebrow: "WAS WIR TUN /",
    titleA: "Von der Idee bis zur Skalierung,",
    titleB: "unter einem Dach.",
    sub: "Strategie, Design, Engineering und Wachstum — keine verstreuten Teams, sondern ein integriertes.",
    items: [
      {
        title: "Produktentdeckung & Strategie",
        body: "Wir verwandeln die Idee durch Nutzerforschung, Marktanalyse und schnelle Prototypen in eine testbare Produktvision.",
        tag: "0–2 Wochen",
      },
      {
        title: "MVP-Engineering",
        body: "Mit skalierbarer Architektur, sauberem Code und moderner Infrastruktur bringen wir die erste Version in Wochen live.",
        tag: "Full-Stack",
      },
      {
        title: "KI-Integration",
        body: "Wir betten LLM-, RAG- und Automatisierungsebenen ins Produkt ein und schaffen Funktionen mit echtem Geschäftswert.",
        tag: "AI-native",
      },
      {
        title: "Wachstum & Skalierung",
        body: "Mit Analytics, Experimenten und Performance-Optimierung bringen wir das Produkt vom ersten Nutzer zu Millionen.",
        tag: "0 → 1 → n",
      },
      {
        title: "Design-System",
        body: "Wir vereinen Marke, Interface und Mikro-Interaktionen in einer skalierbaren Designsprache.",
        tag: "Design Ops",
      },
      {
        title: "Sicherheit & Compliance",
        body: "Authentifizierung, Zahlungen und Datensicherheit bauen wir von Tag eins nach Enterprise-Standards richtig auf.",
        tag: "Enterprise",
      },
    ],
  },
  process: {
    eyebrow: "WIE WIR ARBEITEN /",
    titleA: "In drei Schritten, von null",
    titleAccent: "zur Skalierung.",
    items: [
      {
        title: "Entdecken",
        body: "Wir zerlegen die Idee, kartieren Risiken und Chancen und erstellen einen klaren Fahrplan.",
      },
      {
        title: "Bauen",
        body: "Design und Engineering arbeiten als ein Team; jede Woche wird eine greifbare Version geliefert.",
      },
      {
        title: "Wachsen",
        body: "Wir gehen live, lernen aus Daten und iterieren das Produkt schnell an der echten Marktnachfrage.",
      },
    ],
  },
  marketing: {
    eyebrow: "DIGITALES MARKETING /",
    titleA: "Das Produkt zu bauen reicht nicht —",
    titleAccent: "wir bauen den Motor, der es hörbar macht.",
    sub: "Performance-Marketing, Content und Marke verschmelzen zu einer einzigen Wachstumsmaschine, die mit Daten statt Vermutungen läuft. Vom ersten Nutzer bis zur skalierten Nachfrage halten wir das Schwungrad in Bewegung.",
    items: [
      {
        title: "Performance-Marketing",
        body: "Wir schalten täglich optimierte Kampagnen auf Google, Meta und TikTok, die jeden Cent in ROAS verwandeln.",
        metric: "4,2x",
        metricLabel: "Ø ROAS",
      },
      {
        title: "SEO & Content-Motor",
        body: "Wir steigern organischen Traffic exponentiell mit einem technischen SEO- und Content-System, das Suchintention in Umsatz verwandelt.",
        metric: "+180%",
        metricLabel: "organischer Traffic / 6 Mon.",
      },
      {
        title: "Marke & Positionierung",
        body: "Eine Story, Tonalität und Bildsprache, die aus dem Lärm herausstechen — eine Marke, die man sich merkt.",
        metric: "1 Tag",
        metricLabel: "Marken-Sprint",
      },
      {
        title: "Conversion & CRO",
        body: "Wir schärfen Landing, Funnel und Pricing mit A/B-Tests und holen mehr Umsatz aus demselben Traffic.",
        metric: "+63%",
        metricLabel: "Conversion-Plus",
      },
      {
        title: "Lifecycle & CRM",
        body: "Mit E-Mail, Push und Automatisierung machen wir aus dem ersten Kauf Loyalität und aus Loyalität wiederkehrenden Umsatz.",
        metric: "3,4x",
        metricLabel: "LTV-Steigerung",
      },
      {
        title: "Analytics & Attribution",
        body: "Wir messen jeden Kanal in einem Dashboard und zeigen genau, woher das Wachstum wirklich kommt.",
        metric: "0 blinde Flecken",
        metricLabel: "volle Sichtbarkeit",
      },
    ],
    cta: "Über Wachstum sprechen",
  },
  investors: {
    eyebrow: "INVESTOREN-MATCHING /",
    titleA: "Das richtige Kapital,",
    titleAccent: "am richtigen Tisch.",
    sub: "Ein gutes Produkt muss nicht im Stillen wachsen. Wir bringen investitionsbereite Startups mit unserem Netzwerk aus Angels, VCs und strategischen Partnern zusammen — und setzen dich mit der richtigen Story an den Tisch.",
    steps: [
      {
        title: "Vorbereitung & Bewertung",
        body: "Wir formen Metriken, Narrativ und Data Room so, dass Investoren auf den ersten Blick 'Ja' sagen.",
      },
      {
        title: "Das richtige Match",
        body: "Aus unserem Netzwerk von 300+ Investoren stellen wir Namen vor, die wirklich zu These, Phase und Branche passen.",
      },
      {
        title: "Pitch & Abschluss",
        body: "Vom Deck bis zum Term Sheet stehen wir dir bei; Verhandlung und Due Diligence führen wir gemeinsam.",
      },
    ],
    stats: [
      { value: "300+", label: "Aktives Investorennetzwerk" },
      { value: "64 Mio. €", label: "Vermitteltes Kapital" },
      { value: "40+", label: "Abgeschlossene Runden" },
    ],
    formTitle: "Matching-Bewerbung",
    formSub: "Als Gründer suchst du Kapital, als Investor Chancen. Fülle das Formular aus, wir melden uns innerhalb von 48 Stunden.",
    fields: {
      name: "Vor- und Nachname",
      email: "E-Mail",
      company: "Startup- / Fondsname",
      stage: "Phase",
      ticket: "Runden- / Ticketgröße",
      message: "Kurz erzählen",
      messagePlaceholder: "Was baust du, was suchst du?",
    },
    submit: "Bewerbung senden",
    submitting: "Wird gesendet…",
    success: "Deine Bewerbung ist bei uns. Wir melden uns in Kürze.",
    error: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
    audience: { founder: "Ich bin Gründer und suche Kapital", investor: "Ich bin Investor und suche Deals" },
  },
  ventures: {
    eyebrow: "PORTFOLIO /",
    titleA: "Die Ventures,",
    titleB: "die wir zum Leben erweckt haben.",
    link: "Deins könnte das nächste sein",
    tags: [
      "Fintech · Zahlungsinfrastruktur",
      "SaaS · Remote-Teams",
      "HealthTech · KI-Diagnose",
      "Logistik · Optimierung",
      "EnergyTech · IoT",
      "KI · Generative Inhalte",
    ],
  },
  features: [
    {
      title: "Besessen von Tempo",
      body: "Die erste funktionierende Version misst sich in Wochen, nicht Monaten. Jede Woche echter Fortschritt.",
    },
    {
      title: "Produkt- + Gründer-Denke",
      body: "Wir schreiben nicht nur Code; wir gestalten dein Geschäft, deinen Nutzer und deinen Wachstumsmotor mit.",
    },
    {
      title: "Skalierungsbereite Architektur",
      body: "Wir bauen für den ersten Nutzer dasselbe solide Fundament wie für den millionsten.",
    },
  ],
  testimonials: {
    eyebrow: "WAS GRÜNDER SAGEN /",
    titleA: "Die Geschichten,",
    titleB: "die wir gemeinsam gebaut haben.",
    items: [
      {
        quote:
          "Von der Idee zum veröffentlichten Produkt in 9 Wochen. Invenimus arbeitete wie ein echter Mitgründer, nicht wie eine Agentur.",
        name: "Elif Demir",
        role: "Gründerin, Fintra",
      },
      {
        quote:
          "Sie bauten unsere KI-Funktionen und unsere Conversion-Rate verdoppelte sich. Die Engineering-Qualität ist herausragend.",
        name: "Marco Rossi",
        role: "CTO, Nomad",
      },
      {
        quote:
          "Wir schlossen unsere erste Runde mit dem von ihnen gebauten Prototyp ab. Tempo und Sorgfalt gibt es selten zusammen.",
        name: "Aylin Kaya",
        role: "CEO, Medix",
      },
      {
        quote:
          "Sie lösten unsere Skalierungsprobleme in 3 Monaten. Unsere Infrastruktur trägt jetzt den 10-fachen Traffic mit Leichtigkeit.",
        name: "James Park",
        role: "VP Eng, Cargoo",
      },
    ],
  },
  team: {
    eyebrow: "UNSER TEAM /",
    titleA: "Das Team, dem du deine Idee",
    titleAccent: "anvertraust.",
    sub: "Eine Crew, die Strategie, Design, Engineering und Wachstum unter einem Dach vereint — und Dutzende Produkte von null zur Skalierung gebracht hat.",
    members: [
      {
        name: "Deniz Aydın",
        role: "Gründer & Produkt",
        bio: "Gründer mit zwei Exits. Macht aus Ideen Strategie, aus Strategie Fahrplan.",
      },
      {
        name: "Selin Yılmaz",
        role: "Design-Direktorin",
        bio: "Vereint Marke und Interface in einer Sprache; baut preisgekrönte Produkterlebnisse.",
      },
      {
        name: "Emre Koç",
        role: "Principal Engineer",
        bio: "Eigentümer der skalierungsbereiten Architektur. In Wochen live, danach sanftes Wachstum.",
      },
      {
        name: "Aylin Şahin",
        role: "Head of AI",
        bio: "KI-Ingenieurin, die LLM- und RAG-Ebenen in echten Geschäftswert verwandelt.",
      },
      {
        name: "Can Erdoğan",
        role: "Head of Growth",
        bio: "Dreht das Schwungrad vom ersten Nutzer zu Millionen mit Performance-Marketing und CRO.",
      },
      {
        name: "Zeynep Arı",
        role: "Investor Relations",
        bio: "Architektin des 300+ Investorennetzwerks; verbindet Startups mit dem richtigen Tisch.",
      },
    ],
    joinTitle: "Werde Teil des Teams",
    joinBody: "Wenn du ein Team suchst, das außergewöhnliche Produkte baut, sprechen wir.",
    joinCta: "Offene Stellen",
  },
  faq: {
    eyebrow: "FAQ /",
    titleA: "Fragen,",
    titleB: "die dich beschäftigen.",
    desc: "Keine Antwort gefunden? Schreib uns einfach — wir antworten innerhalb von 24 Stunden.",
    items: [
      {
        q: "Ich habe nur eine Idee und nie Code angefasst. Können wir trotzdem zusammenarbeiten?",
        a: "Auf jeden Fall. Die meisten Partner starten mit einem Deck oder einer Idee in einem Satz. In der Discovery-Phase schärfen wir gemeinsam die Vision und machen daraus einen Fahrplan.",
      },
      {
        q: "Wie lange bis ein MVP live geht?",
        a: "Je nach Umfang, aber typischerweise liefern wir innerhalb von 6–10 Wochen eine funktionierende Version, die echte Nutzer verwenden können.",
      },
      {
        q: "Wem gehören Code und Produkt?",
        a: "Alles gehört dir. Sämtlicher Quellcode, Designdateien und Infrastruktur sind ab Tag eins dein Eigentum. Auf Wunsch übergeben wir vollständig an dein Team.",
      },
      {
        q: "Wie kalkuliert ihr eure Arbeit?",
        a: "Wir bieten Festpreisprojekte, monatliche Retainer und für ausgewählte Ventures eine Mischung aus Equity + Cash. Im ersten Gespräch wählen wir gemeinsam das beste Modell.",
      },
      {
        q: "Unterstützt ihr auch nach dem Launch?",
        a: "Ja. Wir begleiten dich durch das Wachstum: neue Funktionen, Skalierung, Performance und sogar den Aufbau deines Teams.",
      },
    ],
  },
  contact: {
    badge: "Los geht's",
    title: "Hast du eine Idee?",
    desc: "Lass uns die Idee in deinem Kopf in unter 12 Monaten in ein Produkt verwandeln, das echte Nutzer nutzen. Das erste Gespräch ist kostenlos.",
    email: "hello@invenimus.studio",
    backToTop: "Nach oben",
    formName: "Vor- und Nachname",
    formEmail: "E-Mail",
    formIdea: "Deine Idee",
    formIdeaPlaceholder: "Beschreibe die Idee in deinem Kopf in ein paar Sätzen…",
    formSubmit: "Idee senden",
    formSubmitting: "Wird gesendet…",
    formSuccess: "Deine Idee ist bei uns! Wir melden uns innerhalb von 24 Stunden.",
    formError: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
  },
  footer: {
    tagline: "Ein Venture Studio, das Technologie- & Startup-Ideen zum Leben erweckt.",
    links: [
      { label: "Leistungen", href: "#services" },
      { label: "Marketing", href: "#marketing" },
      { label: "Investoren", href: "#investors" },
      { label: "Team", href: "#team" },
      { label: "Kontakt", href: "#contact" },
    ],
    rights: "Invenimus. Istanbul — Berlin.",
    location: "Istanbul — Berlin",
  },
  auth: {
    backHome: "← Zurück zur Startseite",
    unexpectedError: "Ein unerwarteter Fehler ist aufgetreten.",
    gateHint: "Zum Absenden musst du dich anmelden — fülle das Formular aus, wir leiten dich weiter.",
    logout: "Abmelden",
    signInCta: "Anmelden",
    login: {
      eyebrow: "Willkommen zurück",
      brandTitle: "Wo aus Ideen Produkte werden, die live gehen.",
      brandDesc:
        "Melde dich an; verfolge deine Projekte, arbeite mit deinem Team und bring deine Idee auf die nächste Stufe.",
      perks: [
        "Projekt- & Bewerbungsverfolgung",
        "Team- & Investorenzugang",
        "Alles in einem Dashboard",
      ],
      formTitle: "Anmelden",
      formSubtitle: "Gib deine Daten ein, um auf dein Konto zuzugreifen.",
      submit: "Anmelden",
      submitting: "Anmeldung läuft…",
      noAccount: "Noch kein Konto?",
      signUpCta: "Registrieren",
      required: "Benutzername und Passwort sind erforderlich.",
    },
    register: {
      eyebrow: "Werde Teil",
      brandTitle: "Das nächste Venture könnte deins sein.",
      brandDesc:
        "Erstelle dein kostenloses Konto; teile deine Idee, verfolge deinen Fortschritt und werde Teil des Invenimus-Ökosystems.",
      perks: [
        "In Minuten eingerichtet",
        "Bring deine Idee direkt zum Team",
        "Erfahre als Erster von Updates & Chancen",
      ],
      formTitle: "Registrieren",
      formSubtitle: "Erstelle in Sekunden dein kostenloses Konto.",
      submit: "Konto erstellen",
      submitting: "Konto wird erstellt…",
      haveAccount: "Hast du bereits ein Konto?",
      signInCta: "Anmelden",
      terms: "Mit der Registrierung akzeptierst du die Nutzungsbedingungen.",
      allRequired: "Alle Felder sind erforderlich.",
      usernameRule: "Der Benutzername darf nur Buchstaben, Zahlen, - und _ enthalten.",
      invalidEmail: "Gib eine gültige E-Mail ein.",
      passwordMin: "Das Passwort muss mindestens 8 Zeichen lang sein.",
    },
    fields: {
      username: "Benutzername",
      usernamePlaceholder: "benutzername",
      email: "E-Mail",
      emailPlaceholder: "beispiel@email.com",
      password: "Passwort",
      passwordHint: "Mindestens 8 Zeichen",
      forgotPassword: "Passwort vergessen",
      show: "Anzeigen",
      hide: "Verbergen",
    },
  },
};

export const INVENIMUS_COPY: Record<Locale, InvenimusCopy> = { tr, en, de };

export function getInvenimusCopy(locale: Locale): InvenimusCopy {
  return INVENIMUS_COPY[locale] ?? INVENIMUS_COPY.tr;
}

// Çok dilli JSON string ({"tr":"","en":"","de":""}) içinden geçerli dili seçer.
// DB'den gelen CMS/kadro içeriğini landing'de göstermek için kullanılır.
export function pickLang(json: string | null | undefined, locale: Locale): string {
  try {
    const o = JSON.parse(json || "{}");
    return o[locale] || o.tr || o.en || o.de || "";
  } catch {
    return "";
  }
}
