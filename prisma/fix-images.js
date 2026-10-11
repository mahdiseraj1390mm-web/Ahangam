const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const bitaImg = "/uploads/1791700313376-ChatGPT_Image______________________.png";
  const defaultLocalImg = "/logo.png";
  
  // Update artists
  const artists = await prisma.artist.findMany();
  for (const a of artists) {
    if (a.slug === "bita" || a.name.includes("بیتا")) {
      await prisma.artist.update({
        where: { id: a.id },
        data: { image: bitaImg }
      });
    } else if (a.image && a.image.includes("unsplash.com")) {
      await prisma.artist.update({
        where: { id: a.id },
        data: { image: defaultLocalImg }
      });
    }
  }

  // Update albums
  const albums = await prisma.album.findMany();
  for (const alb of albums) {
    if (alb.coverImage && alb.coverImage.includes("unsplash.com")) {
      await prisma.album.update({
        where: { id: alb.id },
        data: { coverImage: defaultLocalImg }
      });
    }
  }

  // Update songs
  const songs = await prisma.song.findMany();
  for (const s of songs) {
    if (s.coverImage && s.coverImage.includes("unsplash.com")) {
      await prisma.song.update({
        where: { id: s.id },
        data: { coverImage: bitaImg }
      });
    }
  }

  // Update stories
  const stories = await prisma.story.findMany();
  for (const st of stories) {
    if (st.mediaUrl && st.mediaUrl.includes("unsplash.com")) {
      await prisma.story.update({
        where: { id: st.id },
        data: { mediaUrl: bitaImg }
      });
    }
  }

  console.log("Success: All Unsplash images replaced with fast local server images!");
}

run()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
