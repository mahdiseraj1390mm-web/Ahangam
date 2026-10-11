const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding for Ahangam...");

  // 1. Password hashes
  const adminPasswordHash = await bcrypt.hash("admin123456", 10);
  const userPasswordHash = await bcrypt.hash("user123456", 10);

  // 2. Create Users
  const superAdmin = await prisma.user.upsert({
    where: { phone: "09120000000" },
    update: {},
    create: {
      phone: "09120000000",
      displayName: "مدیر ارشد آهنگام",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      permissions: JSON.stringify(["ALL"]),
    },
  });

  const subAdmin = await prisma.user.upsert({
    where: { phone: "09121111111" },
    update: {},
    create: {
      phone: "09121111111",
      displayName: "علی رضایی (مدیر محتوا)",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      permissions: JSON.stringify(["SONGS_MANAGE", "COMMENTS_MANAGE", "STORIES_MANAGE"]),
    },
  });

  const vipUser = await prisma.user.upsert({
    where: { phone: "09122222222" },
    update: {},
    create: {
      phone: "09122222222",
      displayName: "سارا محمدی",
      passwordHash: userPasswordHash,
      role: "VIP",
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 3. Create Genres & Moods
  const genres = [
    { name: "پاپ", slug: "pop", isMood: false, icon: "Music" },
    { name: "سنتی و اصیل", slug: "traditional", isMood: false, icon: "Disc" },
    { name: "راک و متال", slug: "rock", isMood: false, icon: "Flame" },
    { name: "هیپ‌هاپ و رپ", slug: "hiphop", isMood: false, icon: "Mic" },
    { name: "آرامش و مدیتیشن", slug: "chill", isMood: true, icon: "Coffee" },
    { name: "رانندگی", slug: "driving", isMood: true, icon: "Car" },
    { name: "پرانرژی و ورزش", slug: "workout", isMood: true, icon: "Zap" },
    { name: "غمگین و دلتنگی", slug: "sad", isMood: true, icon: "CloudRain" },
    { name: "عاشقانه", slug: "romantic", isMood: true, icon: "Heart" },
    { name: "نوستالژیک", slug: "nostalgic", isMood: true, icon: "Clock" },
    { name: "موسیقی بی‌کلام", slug: "instrumental", isMood: true, icon: "Headphones" },
  ];

  for (const g of genres) {
    await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: g,
    });
  }

  // 4. Create Artists (Including "بیتا" as requested in proposal)
  const artistBita = await prisma.artist.upsert({
    where: { slug: "bita" },
    update: {},
    create: {
      name: "بیتا",
      slug: "bita",
      bio: "خواننده و آهنگساز برجسته معاصر با سبک تلفیقی و ترانه‌های ماندگار و شنیدنی.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      isFeatured: true,
      followersCount: 14200,
    },
  });

  const artistYeganeh = await prisma.artist.upsert({
    where: { slug: "mohsen-yeganeh" },
    update: {},
    create: {
      name: "محسن یگانه",
      slug: "mohsen-yeganeh",
      bio: "خواننده، ترانه‌سرا، نوازنده و آهنگساز موسیقی پاپ ایران.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
      isFeatured: true,
      followersCount: 88500,
    },
  });

  const artistShadmehr = await prisma.artist.upsert({
    where: { slug: "shadmehr-aghili" },
    update: {},
    create: {
      name: "شادمهر عقیلی",
      slug: "shadmehr-aghili",
      bio: "خواننده، نوازنده چند سازه و اسطوره تکرارنشدنی موسیقی مدرن فارسی.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
      isFeatured: true,
      followersCount: 120400,
    },
  });

  const artistSirvan = await prisma.artist.upsert({
    where: { slug: "sirvan-khosravi" },
    update: {},
    create: {
      name: "سیروان خسروی",
      slug: "sirvan-khosravi",
      bio: "خواننده، آهنگساز، تنظیم‌کننده پیشرو و صدابردار نامدار ایرانی.",
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80",
      isFeatured: true,
      followersCount: 65100,
    },
  });

  // 5. Create Albums
  const albumBita = await prisma.album.upsert({
    where: { slug: "souvenirs-of-bita" },
    update: {},
    create: {
      title: "یادگار بنفش",
      slug: "souvenirs-of-bita",
      artistId: artistBita.id,
      releaseYear: 1404,
      coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
      isFeatured: true,
    },
  });

  const albumYeganeh = await prisma.album.upsert({
    where: { slug: "rage-khab" },
    update: {},
    create: {
      title: "رگ خواب",
      slug: "rage-khab",
      artistId: artistYeganeh.id,
      releaseYear: 1389,
      coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
      isFeatured: true,
    },
  });

  // Sample reliable audio URLs for online playback test
  const sampleAudio1 = "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg";
  const sampleAudio2 = "https://actions.google.com/sounds/v1/water/lake_waves_lapping.ogg";
  const sampleAudio3 = "https://actions.google.com/sounds/v1/weather/thunder_crack.ogg";

  // 6. Create Songs with Qualities & Synced Lyrics
  const sampleSyncedLyricsBita = JSON.stringify([
    { time: 0, text: "شب و سکوت و این خیال مه‌آلود..." },
    { time: 5, text: "صدای تو در امتداد لحظه‌ها طنین افکند..." },
    { time: 10, text: "چو باران که بر برگ‌های خزان می‌بارد" },
    { time: 16, text: "امید وصل تو در سینه جان می‌گیرد..." },
    { time: 22, text: "آهنگام، نغمه‌ای از دل تا بی‌کران" },
  ]);

  const song1 = await prisma.song.upsert({
    where: { slug: "bita-souvenir-violet" },
    update: {},
    create: {
      title: "یادگار بنفش",
      slug: "bita-souvenir-violet",
      artistId: artistBita.id,
      albumId: albumBita.id,
      duration: 215,
      coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
      lyrics: "شب و سکوت و این خیال مه‌آلود...\nصدای تو در امتداد لحظه‌ها طنین افکند...\nچو باران که بر برگ‌های خزان می‌بارد\nامید وصل تو در سینه جان می‌گیرد...\nآهنگام، نغمه‌ای از دل تا بی‌کران",
      syncedLyrics: sampleSyncedLyricsBita,
      lyricist: "بیتا",
      composer: "بیتا",
      arranger: "سیروان خسروی",
      publisher: "آهنگام ریکوردز",
      playCount: 15420,
      downloadCount: 3820,
      isFeatured: true,
      isEditorPick: true,
      status: "PUBLISHED",
      qualities: {
        create: [
          { quality: "320", fileUrl: sampleAudio1, fileSize: 8600000, isDefault: true },
          { quality: "128", fileUrl: sampleAudio2, fileSize: 3400000, isDefault: false },
          { quality: "FLAC", fileUrl: sampleAudio3, fileSize: 24000000, isDefault: false },
        ],
      },
    },
  });

  const song2 = await prisma.song.upsert({
    where: { slug: "yeganeh-behet-ghol-midam" },
    update: {},
    create: {
      title: "بهت قول میدم",
      slug: "yeganeh-behet-ghol-midam",
      artistId: artistYeganeh.id,
      duration: 205,
      coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80",
      lyrics: "خودت میخوای بری خاطره شی اما دلت میسوزه...\nتظاهر میکنی عاشقمی این بازی هر روزه...",
      lyricist: "محسن یگانه",
      composer: "محسن یگانه",
      arranger: "محسن یگانه",
      publisher: "آوای هنر",
      playCount: 45200,
      downloadCount: 12400,
      isFeatured: true,
      isEditorPick: true,
      status: "PUBLISHED",
      qualities: {
        create: [
          { quality: "320", fileUrl: sampleAudio2, fileSize: 7800000, isDefault: true },
          { quality: "128", fileUrl: sampleAudio1, fileSize: 3100000, isDefault: false },
        ],
      },
    },
  });

  const song3 = await prisma.song.upsert({
    where: { slug: "shadmehr-tajrobeh-kon" },
    update: {},
    create: {
      title: "تجربه کن",
      slug: "shadmehr-tajrobeh-kon",
      artistId: artistShadmehr.id,
      duration: 198,
      coverImage: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=80",
      lyrics: "دست منو محکم بگیر تو این روزای بی‌کسی...\nحس کن حضورو تو دلم پیش از اینکه دیر بشه...",
      lyricist: "آرش مهرابی",
      composer: "وحید پویان",
      arranger: "سعید زمانی",
      publisher: "تصویر دنیای هنر",
      playCount: 38900,
      downloadCount: 9400,
      isFeatured: true,
      status: "PUBLISHED",
      qualities: {
        create: [
          { quality: "320", fileUrl: sampleAudio3, fileSize: 8100000, isDefault: true },
          { quality: "128", fileUrl: sampleAudio1, fileSize: 3200000, isDefault: false },
        ],
      },
    },
  });

  const song4 = await prisma.song.upsert({
    where: { slug: "sirvan-dorost-nemisham" },
    update: {},
    create: {
      title: "درست نمیشم",
      slug: "sirvan-dorost-nemisham",
      artistId: artistSirvan.id,
      duration: 230,
      coverImage: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
      lyrics: "میخوام که حرفامو بشنوی اما سکوت تو سد راهمه...\nدرست نمیشم این منم که توی باتلاق غمه...",
      lyricist: "علی بحرینی",
      composer: "سیروان خسروی",
      arranger: "سیروان خسروی",
      publisher: "زیما",
      playCount: 29500,
      downloadCount: 7100,
      isFeatured: true,
      status: "PUBLISHED",
      qualities: {
        create: [
          { quality: "320", fileUrl: sampleAudio1, fileSize: 9200000, isDefault: true },
          { quality: "128", fileUrl: sampleAudio2, fileSize: 3600000, isDefault: false },
        ],
      },
    },
  });

  // Connect Songs to Genres
  const popGenre = await prisma.genre.findUnique({ where: { slug: "pop" } });
  const chillGenre = await prisma.genre.findUnique({ where: { slug: "chill" } });
  const drivingGenre = await prisma.genre.findUnique({ where: { slug: "driving" } });

  if (popGenre) {
    for (const sId of [song1.id, song2.id, song3.id, song4.id]) {
      await prisma.songGenre.upsert({
        where: { songId_genreId: { songId: sId, genreId: popGenre.id } },
        update: {},
        create: { songId: sId, genreId: popGenre.id },
      });
    }
  }

  if (chillGenre) {
    await prisma.songGenre.upsert({
      where: { songId_genreId: { songId: song1.id, genreId: chillGenre.id } },
      update: {},
      create: { songId: song1.id, genreId: chillGenre.id },
    });
  }

  // 7. Create Stories
  await prisma.story.createMany({
    data: [
      {
        title: "آهنگ جدید بیتا منتشر شد!",
        caption: "همین حالا قطعه «یادگار بنفش» با صدای بیتا را بشنوید.",
        mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
        mediaType: "IMAGE",
        targetUrl: `/song/${song1.slug}`,
        targetType: "SONG",
        targetId: song1.id,
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "کنسرت بزرگ شادمهر",
        caption: "تور کنسرت‌های جدید به زودی در سراسر جهان آغاز می‌شود.",
        mediaUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
        mediaType: "IMAGE",
        targetUrl: `/artist/${artistShadmehr.slug}`,
        targetType: "ARTIST",
        targetId: artistShadmehr.id,
        sortOrder: 2,
        isActive: true,
      },
      {
        title: "پلی‌لیست رانندگی شبانه",
        caption: "مجموعه‌ای آرامش‌بخش برای سفرهای طولانی در جاده.",
        mediaUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80",
        mediaType: "IMAGE",
        targetUrl: `/songs?mood=driving`,
        targetType: "PLAYLIST",
        sortOrder: 3,
        isActive: true,
      },
    ],
  });

  // 8. Create Playlists
  const editorPlaylist = await prisma.playlist.upsert({
    where: { slug: "ahangam-top-hits" },
    update: {},
    create: {
      title: "برترین‌های آهنگام (هفته)",
      slug: "ahangam-top-hits",
      description: "گلچینی از شنیده‌شده‌ترین و محبوب‌ترین آهنگ‌های این هفته به انتخاب سردبیر.",
      coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
      isSystem: true,
      isFeatured: true,
      isPublic: true,
      songs: {
        create: [
          { songId: song1.id, orderIndex: 1 },
          { songId: song2.id, orderIndex: 2 },
          { songId: song3.id, orderIndex: 3 },
          { songId: song4.id, orderIndex: 4 },
        ],
      },
    },
  });

  // 9. Create Subscription Plans
  await prisma.subscriptionPlan.createMany({
    data: [
      {
        name: "اشتراک طلایی ۱ ماهه",
        description: "دسترسی کامل به کیفیت FLAC و ۳۲۰، دانلود نامحدود و بدون تبلیغات",
        durationDays: 30,
        price: 59000,
        maxQuality: "FLAC",
        downloadLimitPerDay: 50,
        sortOrder: 1,
        isActive: true,
      },
      {
        name: "اشتراک الماس ۳ ماهه (محبوب‌ترین)",
        description: "۳ ماه دسترسی VIP همراه با ۲۰٪ تخفیف ویژه و دانلود سریع نیم‌بها",
        durationDays: 90,
        price: 149000,
        maxQuality: "FLAC",
        downloadLimitPerDay: 100,
        sortOrder: 2,
        isActive: true,
      },
      {
        name: "اشتراک ویژه ۱ ساله",
        description: "یک سال کامل با نهایت کیفیت، دسترسی زودتر به آلبوم‌های اختصاصی",
        durationDays: 365,
        price: 490000,
        maxQuality: "FLAC",
        downloadLimitPerDay: 500,
        sortOrder: 3,
        isActive: true,
      },
    ],
  });

  // 10. Create Home Sections (Configurable from Admin Panel)
  await prisma.homeSection.createMany({
    data: [
      { key: "HERO_BANNER", title: "اسلایدر و بنر معرفی", sortOrder: 1, isEnabled: true, showOnMobile: true, showOnDesktop: true, limitCount: 5 },
      { key: "STORIES_TRAY", title: "استوری‌های روز", sortOrder: 2, isEnabled: true, showOnMobile: true, showOnDesktop: true, limitCount: 10 },
      { key: "NEW_RELEASES", title: "جدیدترین آهنگ‌ها", sortOrder: 3, isEnabled: true, showOnMobile: true, showOnDesktop: true, limitCount: 8 },
      { key: "EDITORS_PICK", title: "پیشنهادهای ویژه سردبیر", sortOrder: 4, isEnabled: true, showOnMobile: true, showOnDesktop: true, limitCount: 6 },
      { key: "POPULAR_TODAY", title: "آهنگ‌های محبوب امروز", sortOrder: 5, isEnabled: true, showOnMobile: true, showOnDesktop: true, limitCount: 8 },
      { key: "MOOD_GENRES", title: "سبک‌ها و حال‌وهوا", sortOrder: 6, isEnabled: true, showOnMobile: true, showOnDesktop: true, limitCount: 12 },
      { key: "TOP_ARTISTS", title: "هنرمندان محبوب", sortOrder: 7, isEnabled: true, showOnMobile: true, showOnDesktop: true, limitCount: 6 },
      { key: "FEATURED_ALBUMS", title: "آلبوم‌های برگزیده", sortOrder: 8, isEnabled: true, showOnMobile: true, showOnDesktop: true, limitCount: 4 },
      { key: "FEATURED_PLAYLISTS", title: "پلی‌لیست‌های اختصاصی", sortOrder: 9, isEnabled: true, showOnMobile: true, showOnDesktop: true, limitCount: 4 },
    ],
  });

  // 11. Create Site Settings
  await prisma.siteSetting.createMany({
    data: [
      { key: "SITE_NAME", value: "آهنگام", group: "GENERAL", description: "نام رسمی وبسایت" },
      { key: "SITE_TAGLINE", value: "مرجع مدرن پخش آنلاین و دانلود موسیقی", group: "GENERAL", description: "شعار سایت" },
      { key: "DEFAULT_THEME_COLOR", value: "purple", group: "THEME", description: "رنگ پیش‌فرض سایت (بنفش مدرن)" },
      { key: "DEFAULT_THEME_MODE", value: "dark", group: "THEME", description: "حالت روشنایی پیش‌فرض" },
      { key: "DEFAULT_ARTIST_NAME", value: "بیتا", group: "GENERAL", description: "نام هنرمند پیش‌فرض طبق پروپوزال" },
      { key: "CAN_DOWNLOAD_FREE", value: "true", group: "PLAYER", description: "امکان دانلود رایگان با کیفیت ۱۲۸" },
    ],
  });

  // 12. Create Official Social Links
  await prisma.socialLink.createMany({
    data: [
      { platform: "TELEGRAM", title: "کانال رسمی تلگرام", url: "https://t.me/ahangam_official", sortOrder: 1, isEnabled: true },
      { platform: "INSTAGRAM", title: "صفحه اینستاگرام", url: "https://instagram.com/ahangam_music", sortOrder: 2, isEnabled: true },
      { platform: "RUBIKA", title: "کانال روبیکا", url: "https://rubika.ir/ahangam", sortOrder: 3, isEnabled: true },
      { platform: "EITAA", title: "کانال ایتا", url: "https://eitaa.com/ahangam", sortOrder: 4, isEnabled: true },
    ],
  });

  // 13. Create Comments & Ratings
  await prisma.comment.create({
    data: {
      songId: song1.id,
      userId: vipUser.id,
      text: "فوق‌العاده زیبا و بااحساس بود! اجرای بیتا در این قطعه واقعاً شنیدنی و گوش‌نواز است.",
      status: "APPROVED",
      likesCount: 14,
    },
  });

  await prisma.rating.create({
    data: {
      songId: song1.id,
      userId: vipUser.id,
      score: 5,
    },
  });

  console.log("Database seeded successfully with users, artists, songs, and settings!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
