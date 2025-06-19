"use client";

import { useState } from "react";
import { MessageCircle, User, Bot, Sparkles, Filter } from "lucide-react";

// AI Avatar Generator Function with proper typing
const generateAvatarUrl = (name: string, seed: string): string => {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&size=150&backgroundColor=transparent`;
};

// Define character interface for better type safety
interface Character {
  id: string;
  name: string;
  description: string;
  avatar: string;
  color: string;
  category: string;
  imageUrl: string;
}

// Define characters with categories
const allCharacters: Character[] = [
  // Historical Figures
  {
    id: "cleopatra",
    name: "Cleopatra",
    description: "Last active ruler of Ptolemaic Egypt",
    avatar: "👑",
    color: "from-yellow-600 to-amber-600",
    category: "Historical Figures",
    imageUrl: generateAvatarUrl("Cleopatra", "cleopatra-seed")
  },
  {
    id: "marie_curie",
    name: "Marie Curie",
    description: "Pioneering physicist and chemist",
    avatar: "👩‍🔬",
    color: "from-pink-600 to-rose-600",
    category: "Historical Figures",
    imageUrl: generateAvatarUrl("Marie Curie", "marie-curie-seed")
  },
  {
    id: "da_vinci",
    name: "Leonardo da Vinci",
    description: "Renaissance polymath and artist",
    avatar: "🎨",
    color: "from-orange-600 to-red-600",
    category: "Historical Figures",
    imageUrl: generateAvatarUrl("Leonardo da Vinci", "da-vinci-seed")
  },
  {
    id: "nikola_tesla",
    name: "Nikola Tesla",
    description: "Visionary inventor and electrical engineer",
    avatar: "⚡",
    color: "from-cyan-600 to-blue-600",
    category: "Historical Figures",
    imageUrl: generateAvatarUrl("Nikola Tesla", "nikola-tesla-seed")
  },

  // Philosophers & Thinkers
  {
    id: "socrates",
    name: "Socrates",
    description: "Ancient Greek philosopher",
    avatar: "🏛️",
    color: "from-gray-600 to-slate-600",
    category: "Philosophers & Thinkers",
    imageUrl: generateAvatarUrl("Socrates", "socrates-seed")
  },
  {
    id: "einstein",
    name: "Albert Einstein",
    description: "Theoretical physicist and genius",
    avatar: "👨‍🔬",
    color: "from-green-600 to-emerald-600",
    category: "Philosophers & Thinkers",
    imageUrl: generateAvatarUrl("Albert Einstein", "einstein-seed")
  },
  {
    id: "sun_tzu",
    name: "Sun Tzu",
    description: "Ancient Chinese military strategist",
    avatar: "⚔️",
    color: "from-red-700 to-orange-700",
    category: "Philosophers & Thinkers",
    imageUrl: generateAvatarUrl("Sun Tzu", "sun-tzu-seed")
  },

  // Artists & Writers
  {
    id: "shakespeare",
    name: "William Shakespeare",
    description: "The greatest playwright in history",
    avatar: "✍️",
    color: "from-amber-600 to-orange-600",
    category: "Artists & Writers",
    imageUrl: generateAvatarUrl("William Shakespeare", "shakespeare-seed")
  },
  {
    id: "frida_kahlo",
    name: "Frida Kahlo",
    description: "Passionate Mexican artist",
    avatar: "🌺",
    color: "from-red-600 to-pink-600",
    category: "Artists & Writers",
    imageUrl: generateAvatarUrl("Frida Kahlo", "frida-kahlo-seed")
  },
  {
    id: "jane_austen",
    name: "Jane Austen",
    description: "Beloved English novelist",
    avatar: "📚",
    color: "from-teal-600 to-cyan-600",
    category: "Artists & Writers",
    imageUrl: generateAvatarUrl("Jane Austen", "jane-austen-seed")
  },
  {
    id: "mozart",
    name: "Wolfgang Amadeus Mozart",
    description: "Classical music composer prodigy",
    avatar: "🎼",
    color: "from-indigo-600 to-purple-600",
    category: "Artists & Writers",
    imageUrl: generateAvatarUrl("Wolfgang Amadeus Mozart", "mozart-seed")
  },
  {
    id: "maya_angelou",
    name: "Maya Angelou",
    description: "Inspirational poet and civil rights activist",
    avatar: "🕊️",
    color: "from-purple-700 to-pink-700",
    category: "Artists & Writers",
    imageUrl: generateAvatarUrl("Maya Angelou", "maya-angelou-seed")
  },

  // Fictional Characters
  {
    id: "sherlock",
    name: "Sherlock Holmes",
    description: "Brilliant detective with sharp deductive skills",
    avatar: "🕵️‍♂️",
    color: "from-blue-600 to-indigo-600",
    category: "Fictional Characters",
    imageUrl: generateAvatarUrl("Sherlock Holmes", "sherlock-seed")
  },
  {
    id: "gandalf",
    name: "Gandalf",
    description: "Wise wizard from Middle-earth",
    avatar: "🧙‍♂️",
    color: "from-purple-600 to-violet-600",
    category: "Fictional Characters",
    imageUrl: generateAvatarUrl("Gandalf", "gandalf-seed")
  },

  // Modern Icons
  {
    id: "steve_jobs",
    name: "Steve Jobs",
    description: "Visionary tech entrepreneur",
    avatar: "📱",
    color: "from-gray-700 to-gray-900",
    category: "Modern Icons",
    imageUrl: generateAvatarUrl("Steve Jobs", "steve-jobs-seed")
  },
  {
    id: "oprah",
    name: "Oprah Winfrey",
    description: "Media mogul and inspirational speaker",
    avatar: "🌟",
    color: "from-yellow-500 to-orange-500",
    category: "Modern Icons",
    imageUrl: generateAvatarUrl("Oprah Winfrey", "oprah-seed")
  },

  // Indian Historical Figures
  {
    id: "mahatma_gandhi",
    name: "Mahatma Gandhi",
    description: "Father of the Nation, leader of independence movement",
    avatar: "🕊️",
    color: "from-orange-500 to-green-500",
    category: "Historical Figures",
    imageUrl: generateAvatarUrl("Mahatma Gandhi", "mahatma-gandhi-seed")
  },
  {
    id: "chandragupta_maurya",
    name: "Chandragupta Maurya",
    description: "Founder of the Mauryan Empire",
    avatar: "👑",
    color: "from-yellow-600 to-orange-600",
    category: "Historical Figures",
    imageUrl: generateAvatarUrl("Chandragupta Maurya", "chandragupta-maurya-seed")
  },
  {
    id: "rani_lakshmibai",
    name: "Rani Lakshmibai",
    description: "Warrior queen of Jhansi, freedom fighter",
    avatar: "⚔️",
    color: "from-red-600 to-pink-600",
    category: "Historical Figures",
    imageUrl: generateAvatarUrl("Rani Lakshmibai", "rani-lakshmibai-seed")
  },
  {
    id: "akbar",
    name: "Emperor Akbar",
    description: "Mughal emperor known for religious tolerance",
    avatar: "🏰",
    color: "from-purple-600 to-indigo-600",
    category: "Historical Figures",
    imageUrl: generateAvatarUrl("Emperor Akbar", "akbar-seed")
  },

  // Indian Philosophers & Thinkers
  {
    id: "swami_vivekananda",
    name: "Swami Vivekananda",
    description: "Spiritual leader and philosopher",
    avatar: "🧘‍♂️",
    color: "from-orange-500 to-red-500",
    category: "Philosophers & Thinkers",
    imageUrl: generateAvatarUrl("Swami Vivekananda", "swami-vivekananda-seed")
  },
  {
    id: "chanakya",
    name: "Chanakya (Kautilya)",
    description: "Ancient political strategist and economist",
    avatar: "📜",
    color: "from-amber-600 to-yellow-600",
    category: "Philosophers & Thinkers",
    imageUrl: generateAvatarUrl("Chanakya (Kautilya)", "chanakya-seed")
  },
  {
    id: "adi_shankaracharya",
    name: "Adi Shankaracharya",
    description: "8th-century Hindu philosopher and theologian",
    avatar: "🕉️",
    color: "from-blue-600 to-cyan-600",
    category: "Philosophers & Thinkers",
    imageUrl: generateAvatarUrl("Adi Shankaracharya", "adi-shankaracharya-seed")
  },

  // Indian Artists & Writers
  {
    id: "rabindranath_tagore",
    name: "Rabindranath Tagore",
    description: "Nobel Prize-winning poet and writer",
    avatar: "🎭",
    color: "from-teal-600 to-green-600",
    category: "Artists & Writers",
    imageUrl: generateAvatarUrl("Rabindranath Tagore", "rabindranath-tagore-seed")
  },
  {
    id: "kalidasa",
    name: "Kalidasa",
    description: "Greatest Sanskrit poet and dramatist",
    avatar: "📝",
    color: "from-purple-500 to-pink-500",
    category: "Artists & Writers",
    imageUrl: generateAvatarUrl("Kalidasa", "kalidasa-seed")
  },
  {
    id: "ravi_shankar",
    name: "Ravi Shankar",
    description: "Legendary sitar virtuoso and composer",
    avatar: "🎵",
    color: "from-indigo-500 to-purple-500",
    category: "Artists & Writers",
    imageUrl: generateAvatarUrl("Ravi Shankar", "ravi-shankar-seed")
  },

  // Indian Modern Icons
  {
    id: "apj_abdul_kalam",
    name: "A.P.J. Abdul Kalam",
    description: "People's President and aerospace scientist",
    avatar: "🚀",
    color: "from-blue-500 to-indigo-500",
    category: "Modern Icons",
    imageUrl: generateAvatarUrl("A.P.J. Abdul Kalam", "apj-abdul-kalam-seed")
  },
  {
    id: "cv_raman",
    name: "C.V. Raman",
    description: "Nobel Prize-winning physicist",
    avatar: "🔬",
    color: "from-green-500 to-teal-500",
    category: "Modern Icons",
    imageUrl: generateAvatarUrl("C.V. Raman", "cv-raman-seed")
  },
  {
    id: "mother_teresa",
    name: "Mother Teresa",
    description: "Nobel Peace Prize winner, served the poor",
    avatar: "❤️",
    color: "from-blue-400 to-cyan-400",
    category: "Modern Icons",
    imageUrl: generateAvatarUrl("Mother Teresa", "mother-teresa-seed")
  },
  {
    id: "satyajit_ray",
    name: "Satyajit Ray",
    description: "Legendary filmmaker and artist",
    avatar: "🎬",
    color: "from-gray-600 to-gray-800",
    category: "Artists & Writers",
    imageUrl: generateAvatarUrl("Satyajit Ray", "satyajit-ray-seed")
  },

  // Anime Characters
  {
    id: "naruto",
    name: "Naruto Uzumaki",
    description: "Energetic ninja with dreams of becoming Hokage",
    avatar: "🍥",
    imageUrl: generateAvatarUrl("Naruto Uzumaki", "naruto"),
    color: "from-orange-500 to-yellow-500",
    category: "Anime Characters"
  },
  {
    id: "goku",
    name: "Son Goku",
    description: "Saiyan warrior with incredible fighting spirit",
    avatar: "⚡",
    imageUrl: generateAvatarUrl("Son Goku", "goku"),
    color: "from-orange-600 to-red-600",
    category: "Anime Characters"
  },
  {
    id: "luffy",
    name: "Monkey D. Luffy",
    description: "Rubber pirate captain seeking One Piece",
    avatar: "🏴‍☠️",
    imageUrl: generateAvatarUrl("Monkey D Luffy", "luffy"),
    color: "from-red-500 to-pink-500",
    category: "Anime Characters"
  },
  {
    id: "light_yagami",
    name: "Light Yagami",
    description: "Brilliant student with a god complex",
    avatar: "📓",
    imageUrl: generateAvatarUrl("Light Yagami", "light"),
    color: "from-gray-700 to-red-700",
    category: "Anime Characters"
  },
  {
    id: "edward_elric",
    name: "Edward Elric",
    description: "Fullmetal Alchemist seeking the Philosopher's Stone",
    avatar: "⚗️",
    imageUrl: generateAvatarUrl("Edward Elric", "edward"),
    color: "from-yellow-600 to-orange-600",
    category: "Anime Characters"
  },
  {
    id: "ichigo",
    name: "Ichigo Kurosaki",
    description: "Soul Reaper protecting both worlds",
    avatar: "⚔️",
    imageUrl: generateAvatarUrl("Ichigo Kurosaki", "ichigo"),
    color: "from-orange-500 to-red-500",
    category: "Anime Characters"
  },
  {
    id: "vegeta",
    name: "Vegeta",
    description: "Proud Saiyan prince and elite warrior",
    avatar: "👑",
    imageUrl: generateAvatarUrl("Vegeta", "vegeta"),
    color: "from-blue-700 to-purple-700",
    category: "Anime Characters"
  },
  {
    id: "sasuke",
    name: "Sasuke Uchiha",
    description: "Last survivor of the Uchiha clan",
    avatar: "🔥",
    imageUrl: generateAvatarUrl("Sasuke Uchiha", "sasuke"),
    color: "from-purple-600 to-indigo-600",
    category: "Anime Characters"
  },
  {
    id: "saitama",
    name: "Saitama",
    description: "Hero who can defeat any enemy with one punch",
    avatar: "👊",
    imageUrl: generateAvatarUrl("Saitama", "saitama"),
    color: "from-yellow-400 to-red-400",
    category: "Anime Characters"
  },
  {
    id: "tanjiro",
    name: "Tanjiro Kamado",
    description: "Demon slayer with a kind heart",
    avatar: "🗡️",
    imageUrl: generateAvatarUrl("Tanjiro Kamado", "tanjiro"),
    color: "from-green-500 to-teal-500",
    category: "Anime Characters"
  },
  {
    id: "senku",
    name: "Senku Ishigami",
    description: "Genius scientist rebuilding civilization",
    avatar: "🧪",
    imageUrl: generateAvatarUrl("Senku Ishigami", "senku"),
    color: "from-green-400 to-blue-400",
    category: "Anime Characters"
  },
  {
    id: "rimuru",
    name: "Rimuru Tempest",
    description: "Slime who became a demon lord",
    avatar: "💧",
    imageUrl: generateAvatarUrl("Rimuru Tempest", "rimuru"),
    color: "from-blue-400 to-cyan-400",
    category: "Anime Characters"
  }
];

// Category styles interface
interface CategoryStyle {
  color: string;
  icon: string;
  bgColor: string;
}

// Category colors and icons with proper typing
const categoryStyles: Record<string, CategoryStyle> = {
  "Historical Figures": {
    color: "from-amber-500 to-orange-500",
    icon: "🏛️",
    bgColor: "bg-amber-50 dark:bg-amber-900/20"
  },
  "Philosophers & Thinkers": {
    color: "from-blue-500 to-indigo-500",
    icon: "🧠",
    bgColor: "bg-blue-50 dark:bg-blue-900/20"
  },
  "Artists & Writers": {
    color: "from-purple-500 to-pink-500",
    icon: "🎨",
    bgColor: "bg-purple-50 dark:bg-purple-900/20"
  },
  "Fictional Characters": {
    color: "from-green-500 to-emerald-500",
    icon: "📚",
    bgColor: "bg-green-50 dark:bg-green-900/20"
  },
  "Modern Icons": {
    color: "from-red-500 to-rose-500",
    icon: "⭐",
    bgColor: "bg-red-50 dark:bg-red-900/20"
  },
  "Anime Characters": {
    color: "from-pink-500 to-purple-500",
    icon: "🎌",
    bgColor: "bg-pink-50 dark:bg-pink-900/20"
  }
};

// Message interface
interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export default function CharacterChatPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Get unique categories
  const categories = ["All", ...new Set(allCharacters.map(char => char.category))];

  // Filter characters by category
  const filteredCharacters = selectedCategory === "All" 
    ? allCharacters 
    : allCharacters.filter(char => char.category === selectedCategory);

  // Group characters by category for display
  const groupedCharacters = categories.slice(1).reduce((acc: Record<string, Character[]>, category) => {
    acc[category] = allCharacters.filter(char => char.category === category);
    return acc;
  }, {});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      id: Date.now(), 
      role: 'user', 
      content: input 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const requestBody = {
        messages: [...messages, userMessage],
        characterId: selectedCharacter?.id
      };

      const response = await fetch('/api/character-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (response.ok && data.message) {
        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.message
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('API Error:', data);
        alert(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Request error:', error);
      alert('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setSelectedCharacter(null);
    setMessages([]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Character AI Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Chat with famous characters from different eras and fields
          </p>
        </div>

        {!selectedCharacter ? (
          <div>
            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Browse by Category
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category === "All" ? "🌟 All Characters" : `${categoryStyles[category]?.icon} ${category}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Character Display */}
            {selectedCategory === "All" ? (
              /* Show all categories */
              <div className="space-y-8">
                {Object.entries(groupedCharacters).map(([category, characters]) => (
                  <div key={category}>
                    <div className={`${categoryStyles[category].bgColor} rounded-lg p-4 mb-4`}>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <span className="text-2xl">{categoryStyles[category].icon}</span>
                        {category}
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                          ({characters.length} characters)
                        </span>
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {characters.map((character) => (
                        <CharacterCard 
                          key={character.id} 
                          character={character} 
                          onClick={() => setSelectedCharacter(character)} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Show filtered category */
              <div>
                <div className={`${categoryStyles[selectedCategory].bgColor} rounded-lg p-4 mb-6`}>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                    <span className="text-3xl">{categoryStyles[selectedCategory].icon}</span>
                    {selectedCategory}
                    <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                      ({filteredCharacters.length} characters)
                    </span>
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredCharacters.map((character) => (
                    <CharacterCard 
                      key={character.id} 
                      character={character} 
                      onClick={() => setSelectedCharacter(character)} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Chat Interface */
          <div className="max-w-4xl mx-auto">
            {/* Character Header */}
            <div className={`bg-gradient-to-r ${selectedCharacter.color} rounded-t-xl p-6 text-white relative overflow-hidden`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              </div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  {/* Character Image/Avatar */}
                  {selectedCharacter.imageUrl ? (
                    <div className="relative">
                      <img
                        src={selectedCharacter.imageUrl}
                        alt={selectedCharacter.name}
                        className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="text-4xl">{selectedCharacter.avatar}</div>
                  )}
                  
                  <div>
                    <h2 className="text-2xl font-bold drop-shadow-lg">{selectedCharacter.name}</h2>
                    <p className="opacity-90 text-sm">{selectedCharacter.description}</p>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full mt-2 inline-block backdrop-blur-sm">
                      {selectedCharacter.category}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={resetChat}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  Change Character
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="bg-white dark:bg-gray-800 min-h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Start a conversation with {selectedCharacter.name}</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${
                        message.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          message.role === "user" 
                            ? "bg-blue-600 text-white" 
                            : `bg-gradient-to-r ${selectedCharacter.color} text-white`
                        }`}>
                          {message.role === "user" ? <User className="h-4 w-4" /> : selectedCharacter.avatar}
                        </div>
                        <div className={`p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        }`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r ${selectedCharacter.color} text-white`}>
                        {selectedCharacter.avatar}
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Chat with ${selectedCharacter.name}...`}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={`bg-gradient-to-r ${selectedCharacter.color} hover:opacity-90 text-white px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                  >
                    <Sparkles className="h-4 w-4" />
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Character Card Component with proper typing
interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

function CharacterCard({ character, onClick }: CharacterCardProps) {
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-200 dark:border-gray-700 overflow-hidden group"
    >
      <div className={`bg-gradient-to-r ${character.color} p-4 rounded-t-xl text-center relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>
        
        {/* Character Image/Avatar */}
        <div className="relative z-10">
          {character.imageUrl && !imageError ? (
            <div className="relative mx-auto w-20 h-20 mb-3">
              {imageLoading && (
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
              )}
              <img
                src={character.imageUrl}
                alt={character.name}
                className={`w-full h-full rounded-full object-cover border-3 border-white shadow-lg transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                loading="lazy"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
              {character.avatar}
            </div>
          )}
          
          <h3 className="text-white font-bold text-sm leading-tight drop-shadow-lg">
            {character.name}
          </h3>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-300 text-xs mb-3 line-clamp-2">
          {character.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
            Free Model
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {character.category.split(' ')[0]}
          </span>
        </div>
      </div>
    </div>
  );
}
