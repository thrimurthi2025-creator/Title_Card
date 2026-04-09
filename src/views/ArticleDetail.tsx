import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';

const articleContent: { [key: string]: { title: string, content: string } } = {
  '1': {
    title: 'Why Movie Title Cards Matter in Cinema',
    content: 'The title card is the silent prologue to every cinematic journey. Often overlooked, it is the first point of contact between the filmmaker and the audience, setting the tone, establishing the genre, and creating an atmosphere before the first scene even begins. From the bold, iconic typography of classic thrillers to the minimalist, elegant designs of modern dramas, title cards serve as a visual prologue to the story. They can hint at the themes, the setting, or the emotional journey that the audience is about to embark on.\n\nConsider the impact of a title card. It is not merely functional; it is an artistic statement. A well-designed title card can be as memorable as the film itself, becoming an iconic image that represents the entire movie. In the age of digital media, title cards have evolved, but their fundamental purpose remains the same: to captivate the audience and draw them into the world of the film. They are a testament to the power of design and its ability to shape our perception of storytelling.\n\nAs we continue to explore the art of cinema, it is important to appreciate the subtle, yet significant role that title cards play in creating the magic of movies. They are the silent narrators, the visual cues that guide us through the cinematic landscape, and the artistic signatures of the filmmakers who bring these stories to life. Whether they are hand-drawn, animated, or digitally rendered, title cards are a vital component of the cinematic language, and their impact on our viewing experience should not be underestimated. By paying attention to these details, we can gain a deeper understanding and appreciation for the craft of filmmaking and the artistry that goes into every frame of a movie. It reminds us that cinema is a medium of layers, where every element, no matter how small, contributes to the overall narrative and artistic vision.'
  },
  '2': {
    title: 'Top 10 Best Title Cards in Movies',
    content: 'The history of cinema is filled with iconic title cards that have left a lasting impression on audiences. From the classic, hand-painted titles of the golden age of Hollywood to the sleek, modern designs of today, these title cards have become legendary in their own right. Some of the most memorable title cards include those from films like "Vertigo," "Psycho," "Star Wars," and "The Godfather." These title cards not only introduce the film but also set the mood and style, creating an anticipation for what is to come. They are a masterclass in design, using typography, color, and motion to convey the essence of the story.\n\nFor example, the title card for "Vertigo" with its swirling, hypnotic design perfectly captures the film\'s themes of obsession and disorientation. Similarly, the stark, bold typography of "Psycho" immediately sets a tone of tension and dread. These title cards are more than just text on a screen; they are works of art that contribute to the overall cinematic experience. As we look back at the history of cinema, it is clear that title cards have played a crucial role in shaping the way we perceive and remember movies. They are the visual anchors that ground us in the world of the film and the artistic expressions that define the cinematic style of the director. Whether you are a fan of classic cinema or modern blockbusters, the title cards of these legendary films continue to inspire and captivate audiences, proving that even the smallest details can have a profound impact on the art of storytelling.'
  },
  '3': {
    title: 'Hidden Details in Famous Movie Title Cards',
    content: 'Have you ever looked closely at a movie title card and noticed something you missed before? Many filmmakers hide subtle details, Easter eggs, or symbolic elements within their title cards that can provide deeper insights into the film\'s themes and narrative. These hidden details can range from subtle references to the plot, clues about the characters, or even nods to other films. For example, some filmmakers might use specific fonts, colors, or imagery that are significant to the story or the director\'s style. Others might include hidden messages or symbols that only become apparent upon closer inspection.\n\nThese details are a testament to the attention to detail and the creative vision of the filmmakers. They reward observant viewers and add a layer of complexity and intrigue to the film. By taking the time to analyze these title cards, we can uncover a wealth of information that enriches our understanding and appreciation of the film. It\'s like a treasure hunt, where the title card is the first clue in a larger mystery. Whether you are a casual viewer or a dedicated cinephile, exploring these hidden details can be a fun and rewarding experience. It reminds us that cinema is a medium of layers, where every element, no matter how small, contributes to the overall narrative and artistic vision. So, the next time you watch a movie, pay close attention to the title card—you never know what secrets might be hidden in plain sight.'
  },
  '4': {
    title: 'How Directors Use Title Cards Creatively',
    content: 'Directors have always used title cards as a creative tool to enhance the storytelling and visual style of their films. From the way they are presented to the timing and placement, title cards can be used to create suspense, build anticipation, or even subvert audience expectations. Some directors might use title cards to introduce characters, establish the setting, or even provide context for the story. Others might use them to create a sense of mystery or intrigue, leaving the audience guessing about what is to come.\n\nThe creative use of title cards can also be a way for directors to showcase their unique artistic vision and style. Whether it\'s through the use of typography, animation, or even live-action elements, title cards can be a powerful medium for creative expression. They can be integrated seamlessly into the film, becoming an extension of the narrative rather than just a separate element. This creative approach to title cards can elevate the film, making it more immersive and engaging for the audience. As cinema continues to evolve, it is exciting to see how directors are pushing the boundaries of what is possible with title cards. They are constantly finding new and innovative ways to use this simple yet effective tool to enhance the cinematic experience. By embracing the creative potential of title cards, directors can create films that are not only visually stunning but also emotionally resonant and intellectually stimulating.'
  },
  '5': {
    title: 'Best Malayalam Movie Title Cards',
    content: 'Malayalam cinema has a rich history of innovative and artistic title card designs that have set a benchmark in Indian cinema. From the classic films of the past to the modern masterpieces of today, Malayalam filmmakers have always been at the forefront of creative title card design. These title cards often reflect the cultural, social, and political themes of the films, using typography and imagery that are deeply rooted in the Malayalam language and culture.\n\nSome of the most iconic Malayalam title cards include those from films like "Manichitrathazhu," "Oru Vadakkan Veeragatha," and "Kumbalangi Nights." These title cards are a testament to the creativity and artistic vision of Malayalam filmmakers, who have consistently pushed the boundaries of cinematic storytelling. They are a celebration of the Malayalam language and culture, and they continue to inspire and captivate audiences both within and outside Kerala. As we look back at the history of Malayalam cinema, it is clear that title cards have played a crucial role in shaping the way we perceive and remember these films. They are the visual anchors that ground us in the world of the film and the artistic expressions that define the cinematic style of the director. Whether you are a fan of classic Malayalam cinema or modern masterpieces, the title cards of these films continue to inspire and captivate audiences, proving that even the smallest details can have a profound impact on the art of storytelling.'
  }
};

export function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const article = id ? articleContent[id] : null;

  if (!article) {
    return <div className="p-8 text-foreground">Article not found.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-6 max-w-3xl mx-auto"
    >
      <h1 className="text-4xl font-heading font-extrabold text-foreground">{article.title}</h1>
      <div className="text-foreground/80 leading-relaxed space-y-4">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </motion.div>
  );
}
