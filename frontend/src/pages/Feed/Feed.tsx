import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Clock, Flame, ChefHat, Plus, 
  Loader2, X, Users, Heart, Globe,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { recipeApi, favoriteApi } from '../../services/api';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { ALL_REGIONS } from '../../config/regions';
import { cn } from '../../utils';

interface Recipe {
  _id: string;
  title: string;
  description?: string;
  mainImage?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags?: string[];
  nutrition?: { calories?: number };
  ingredients?: any[];
  steps?: string[];
  isFromAPI?: boolean;
}

const RECIPES_PER_PAGE = 8;

// Use backend proxy to avoid CORS issues
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const MEALDB_PROXY = `${API_BASE}/mealdb`;

const CATEGORY_MAP: Record<string, string> = {
  'breakfast': 'Breakfast',
  'dessert': 'Dessert',
  'vegetarian': 'Vegetarian',
  'seafood': 'Seafood',
  'chicken': 'Chicken',
  'beef': 'Beef',
  'pasta': 'Pasta',
};

// ============================================================
// COMPREHENSIVE BULGARIAN TRANSLATION SYSTEM
// ============================================================

// Full recipe title translations (exact match)
const EXACT_TITLE_TRANSLATIONS: Record<string, string> = {
  // === Popular / Common ===
  'Sushi': 'Суши',
  'Spaghetti Carbonara': 'Спагети Карбонара',
  'Spaghetti Bolognese': 'Спагети Болонезе',
  'Chicken Curry': 'Пилешко къри',
  'Beef Stew': 'Телешка яхния',
  'Fish and Chips': 'Риба с чипс',
  'Fish & Chips': 'Риба с чипс',
  'Pancakes': 'Палачинки',
  'Chocolate Cake': 'Шоколадова торта',
  'Chocolate Gateau': 'Шоколадова торта',
  'Greek Salad': 'Гръцка салата',
  'Pizza': 'Пица',
  'Lasagna': 'Лазаня',
  'Lasagne': 'Лазаня',
  'Pad Thai': 'Пад Тай',
  'Ramen': 'Рамен',
  'Teriyaki Chicken Casserole': 'Пиле Терияки запеканка',
  'Teriyaki Chicken': 'Пиле Терияки',
  'Chicken Teriyaki': 'Пиле Терияки',
  'Kung Pao Chicken': 'Пиле Кунг Пао',
  'Kung Po Chicken': 'Пиле Кунг Пао',
  'Sweet and Sour Pork': 'Свинско в кисело-сладко',
  'Sweet and Sour Chicken': 'Пиле в кисело-сладко',
  'Fried Rice': 'Пържен ориз',
  'Risotto': 'Ризото',
  'Croissant': 'Кроасан',
  'Croissants': 'Кроасани',
  'Biryani': 'Бирияни',
  'Kebab': 'Кебап',
  'Falafel': 'Фалафел',
  'Hummus': 'Хумус',
  'Shawarma': 'Шаурма',
  'Tacos': 'Такос',
  'Burrito': 'Бурито',
  'Enchiladas': 'Енчиладас',
  'Paella': 'Паеля',
  'Tiramisu': 'Тирамису',
  'Creme Brulee': 'Крем брюле',
  'Apple Pie': 'Ябълков пай',
  'Cheesecake': 'Чийзкейк',
  'Brownies': 'Брауни',
  'Waffles': 'Гофрети',
  'French Toast': 'Френски тост',
  'Omelette': 'Омлет',
  'Scrambled Eggs': 'Бъркани яйца',
  'Caesar Salad': 'Салата Цезар',
  'Minestrone': 'Минестроне',
  'Gazpacho': 'Гаспачо',
  'Bouillabaisse': 'Буябес',
  'Coq au Vin': 'Петел във вино',
  'Beef Bourguignon': 'Телешко по бургундски',
  'Ratatouille': 'Рататуй',
  'Moussaka': 'Мусака',
  'Gyros': 'Гирос',
  'Tzatziki': 'Цацики',
  'Dolma': 'Долма',
  'Baklava': 'Баклава',
  'Samosa': 'Самоса',
  'Naan': 'Наан',
  'Tandoori Chicken': 'Пиле Тандури',
  'Butter Chicken': 'Пиле в масло',
  'Dal': 'Дал',
  'Masala': 'Масала',
  'Vindaloo': 'Виндалу',
  'Korma': 'Корма',
  'Tikka Masala': 'Тика масала',
  'Chicken Tikka Masala': 'Пиле Тика Масала',
  'Chicken Tikka': 'Пиле Тика',
  'Dumplings': 'Кнедли',
  'Spring Rolls': 'Спринг ролс',
  'Dim Sum': 'Дим сум',
  'Wonton': 'Уонтон',
  'Chow Mein': 'Чоу мейн',
  'Lo Mein': 'Ло мейн',
  'Mapo Tofu': 'Мапо тофу',
  'General Tso Chicken': 'Пиле Дженерал Цо',
  'General Tso\'s Chicken': 'Пиле Дженерал Цо',
  'Orange Chicken': 'Портокалово пиле',
  'Beef and Broccoli': 'Телешко с броколи',
  'Tempura': 'Темпура',
  'Miso Soup': 'Мисо супа',
  'Udon': 'Удон',
  'Soba': 'Соба',
  'Onigiri': 'Онигири',
  'Katsu': 'Кацу',
  'Katsu Chicken': 'Пиле Кацу',
  'Chicken Katsu': 'Пиле Кацу',
  'Yakitori': 'Якитори',
  'Bulgogi': 'Булгоги',
  'Bibimbap': 'Бибимбап',
  'Kimchi': 'Кимчи',
  'Pho': 'Фо',
  'Banh Mi': 'Бан Ми',
  'Tom Yum': 'Том Ям',
  'Tom Yum Goong': 'Том Ям с скариди',
  'Green Curry': 'Зелено къри',
  'Red Curry': 'Червено къри',
  'Massaman Curry': 'Масаман къри',
  'Thai Green Curry': 'Тайландско зелено къри',
  'Satay': 'Сатай',
  'Laksa': 'Лакса',
  'Nasi Goreng': 'Наси Горенг',
  'Rendang': 'Ренданг',
  
  // === British ===
  'Roast Chicken': 'Печено пиле',
  'Roast Beef': 'Печено телешко',
  'Grilled Chicken': 'Пиле на скара',
  'Fried Chicken': 'Пържено пиле',
  'Grilled Steak': 'Стек на скара',
  'Pork Chops': 'Свински котлети',
  'Lamb Chops': 'Агнешки котлети',
  'Salmon': 'Сьомга',
  'Grilled Fish': 'Риба на скара',
  'Grilled Salmon': 'Сьомга на скара',
  'Shrimp': 'Скариди',
  'Lobster': 'Омар',
  'Meatballs': 'Кюфтета',
  'Meatloaf': 'Руло Стефани',
  'Hamburger': 'Хамбургер',
  'Hot Dog': 'Хот дог',
  'Sandwich': 'Сандвич',
  'Stew': 'Яхния',
  'Casserole': 'Запеканка',
  'Roasted Vegetables': 'Печени зеленчуци',
  'Mashed Potatoes': 'Картофено пюре',
  'French Fries': 'Пържени картофки',
  'Baked Potato': 'Печен картоф',
  'Shepherd\'s Pie': 'Пастирски пай',
  'Shepherds Pie': 'Пастирски пай',
  'Shepherd Pie': 'Пастирски пай',
  'Cottage Pie': 'Домашен пай',
  'Beef and Mustard Pie': 'Пай с телешко и горчица',
  'Steak and Kidney Pie': 'Пай с телешко и бъбреци',
  'Yorkshire Pudding': 'Йоркширски пудинг',
  'Bangers and Mash': 'Наденички с пюре',
  'Toad in the Hole': 'Наденички в тесто',
  'Full English Breakfast': 'Пълна английска закуска',
  'English Breakfast': 'Английска закуска',
  'Scones': 'Сконове',
  'Beef Wellington': 'Телешко Уелингтън',
  'Cornish Pasties': 'Корнуолски пастети',
  'Scotch Eggs': 'Шотландски яйца',
  'Treacle Tart': 'Тарт с меласа',
  'Spotted Dick': 'Пудинг със стафиди',
  'Bread and Butter Pudding': 'Пудинг с хляб и масло',
  'Sticky Toffee Pudding': 'Карамелен пудинг',
  'Victoria Sponge': 'Бисквитена торта Виктория',
  'Battenberg Cake': 'Торта Батенберг',
  'Chelsea Bun': 'Кифличка Челси',
  'Eccles Cake': 'Кейк Еклс',
  'Dundee Cake': 'Кейк Дънди',
  'Summer Pudding': 'Летен пудинг',
  'Eton Mess': 'Итън Мес',
  'Blackberry Fool': 'Десерт с къпини',
  
  // === French & Italian ===
  'Creme Caramel': 'Крем карамел',
  'Souffle': 'Суфле',
  'Quiche': 'Киш',
  'Quiche Lorraine': 'Киш Лорен',
  'Crepe': 'Крепи',
  'Crepes': 'Крепи',
  'Eclair': 'Еклер',
  'French Onion Soup': 'Френска лучена супа',
  'Onion Soup': 'Лучена супа',
  'Nicoise Salad': 'Салата Ница',
  'Niçoise Salad': 'Салата Ница',
  'Provencal Omelette': 'Провансалски омлет',
  'Tarte Tatin': 'Тарт Татен',
  'Beef Daube': 'Телешко доб',
  'Cassoulet': 'Касуле',
  'Penne Arrabiata': 'Пене Арабиата',
  'Pasta Carbonara': 'Паста Карбонара',
  'Fettuccine Alfredo': 'Фетучини Алфредо',
  'Gnocchi': 'Ньоки',
  'Bruschetta': 'Брускета',
  'Caprese Salad': 'Салата Капрезе',
  'Osso Buco': 'Осо буко',
  'Saltimbocca': 'Салтимбока',
  'Panna Cotta': 'Пана Кота',
  'Calzone': 'Калцоне',
  'Focaccia': 'Фокача',
  'Ciabatta': 'Чиабата',
  'Ravioli': 'Равиоли',
  'Tortellini': 'Тортелини',

  // === Indian & Middle Eastern ===
  'Lamb Biryani': 'Агнешко бирияни',
  'Chicken Biryani': 'Пилешко бирияни',
  'Palak Paneer': 'Палак панир',
  'Chana Masala': 'Чана масала',
  'Aloo Gobi': 'Алу Гоби',
  'Chicken Madras': 'Пиле Мадрас',
  'Chicken Jalfrezi': 'Пиле Джалфрези',
  'Lamb Rogan Josh': 'Агнешко Роган Джош',
  'Rogan Josh': 'Роган Джош',
  'Naan Bread': 'Хляб наан',
  'Chapati': 'Чапати',
  'Pakora': 'Пакора',
  'Bhaji': 'Бхаджи',
  'Onion Bhaji': 'Бхаджи с лук',
  'Raita': 'Райта',
  'Tabbouleh': 'Табуле',
  'Baba Ganoush': 'Баба гануш',
  'Pita': 'Пита',
  'Kofta': 'Кюфте',
  'Shish Kebab': 'Шиш кебап',
  'Lamb Tagine': 'Агнешко тажин',
  'Tagine': 'Тажин',
  'Couscous': 'Кускус',
  
  // === Mexican / Latin ===
  'Quesadilla': 'Кесадия',
  'Guacamole': 'Гуакамоле',
  'Nachos': 'Начос',
  'Churros': 'Чурос',
  'Fajitas': 'Фахитас',
  'Chili con Carne': 'Чили кон карне',
  'Chilli con Carne': 'Чили кон карне',
  
  // === Greek ===
  'Souvlaki': 'Сувлаки',
  'Spanakopita': 'Спанакопита',
  'Dolmades': 'Долми',
  'Kolo': 'Коло',
  'Avgolemono': 'Авголемоно',
  
  // === Korean ===
  'Korean Fried Chicken': 'Корейско пържено пиле',
  'Japchae': 'Джапче',
  
  
  
  // === American ===
  'Mac and Cheese': 'Макарони със сирене',
  'Mac & Cheese': 'Макарони със сирене',
  'Buffalo Wings': 'Бъфало крилца',
  'BBQ Ribs': 'BBQ ребра',
  'Brownie': 'Брауни',
  'Chocolate Chip Cookies': 'Бисквити с шоколад',
  'Grilled Cheese': 'Препечен сандвич със сирене',
  'Clam Chowder': 'Супа с миди',
  'New England Clam Chowder': 'Супа с миди Нова Англия',
  'Coleslaw': 'Зелева салата',
  'BLT Sandwich': 'БЛТ сандвич',
  
  // === Spanish ===
  'Tapas': 'Тапас',
  'Tortilla Espanola': 'Испанска тортия',
  'Spanish Tortilla': 'Испанска тортия',
  'Patatas Bravas': 'Пататас бравас',
  'Chorizo': 'Чоризо',
  
  // === German / Central European ===
  'Schnitzel': 'Шницел',
  'Bratwurst': 'Братвурст',
  'Strudel': 'Щрудел',
  'Apple Strudel': 'Ябълков щрудел',
  'Goulash': 'Гулаш',
  'Sauerkraut': 'Кисело зеле',
  'Pretzel': 'Кифличка (претцел)',
  
  // === Desserts & Baked goods ===
  'Chocolate Mousse': 'Шоколадов мус',
  'Bread Pudding': 'Пудинг с хляб',
  'Rice Pudding': 'Мляко с ориз',
  'Fruit Salad': 'Плодова салата',
  'Banana Bread': 'Бананов хляб',
  'Carrot Cake': 'Морковена торта',
  'Lemon Drizzle Cake': 'Лимонена торта',
  'Red Velvet Cake': 'Торта Червено кадифе',
  'Chocolate Brownie': 'Шоколадово брауни',
  'Treacle Pudding': 'Пудинг с меласа',
  'Christmas Pudding': 'Коледен пудинг',
  'Mince Pies': 'Коледни питки',
  'Hot Chocolate Fudge': 'Горещ шоколадов фъдж',
  'Jam Roly-Poly': 'Руло със сладко',
  'Bakewell Tart': 'Тарт Бейкуел',
  'Rock Cakes': 'Скални кейкчета',
  'Madeira Cake': 'Кейк Мадейра',
  'Blackberry and Apple Crumble': 'Крамбъл с къпини и ябълки',
  'Apple Crumble': 'Ябълков крамбъл',
  'Peach Cobbler': 'Праскова коблер',
  'Key Lime Pie': 'Пай с лайм',
  'Pumpkin Pie': 'Тиквен пай',
  'Banana Pancakes': 'Бананови палачинки',
  'Blueberry Muffins': 'Мъфини с боровинки',
  'Chocolate Muffins': 'Шоколадови мъфини',
  'Cinnamon Rolls': 'Канелени рулца',
  
  // === Soups ===
  'Tomato Soup': 'Доматена супа',
  'Chicken Soup': 'Пилешка супа',
  'Mushroom Soup': 'Гъбена супа',
  'Cream of Mushroom Soup': 'Крем супа от гъби',
  'Pumpkin Soup': 'Тиквена супа',
  'Lentil Soup': 'Леща супа',
  'Broccoli Soup': 'Супа от броколи',
  'Leek and Potato Soup': 'Супа от праз и картофи',
  'Split Pea Soup': 'Грахова супа',
  'Ribollita': 'Риболита',
  
  // === Salads ===
  'Waldorf Salad': 'Салата Валдорф',
  'Potato Salad': 'Картофена салата',
  'Tuna Salad': 'Салата с тон',
  'Chicken Salad': 'Пилешка салата',
  'Pasta Salad': 'Салата с паста',
  
  // === Misc common MealDB recipes ===
  'Bitterballen (Dutch meatballs)': 'Битербален (Холандски кюфтенца)',
  'Bitterballen': 'Битербален',
  'Dutch Baby Pancake': 'Холандска бебешка палачинка',
  'Stamppot': 'Стампот',
  'Poutine': 'Путин',
  'Pierogi': 'Пироги',
  'Borscht': 'Борш',
  'Chicken Enchilada Casserole': 'Пилешка енчилада запеканка',
  'Honey Teriyaki Salmon': 'Сьомга с мед и терияки',
  'Salmon Teriyaki': 'Сьомга Терияки',
  'Beef Brisket Pot Roast': 'Печено телешко',
  'Chicken Alfredo Primavera': 'Пиле Алфредо Примавера',
  'Chicken Fajita Mac and Cheese': 'Фахита с пиле и макарони',
  'Chicken Congee': 'Пилешко конджи',
  'Chicken Couscous': 'Пиле с кускус',
  'Chicken Handi': 'Пиле Ханди',
  'Chicken Karaage': 'Пиле Караге',
  'Chicken Marengo': 'Пиле Маренго',
  'Chicken Parmentier': 'Пиле Пармантие',
  'Chicken & mushroom Hotpot': 'Гювеч с пиле и гъби',
  'Cream Cheese Tart': 'Тарт със крема сирене',
  'Egg Drop Soup': 'Супа с яйце',
  'Egyptian Fatteh': 'Египетски фате',
  'Fish Stew with Rouille': 'Рибена яхния с руй',
  'Flamiche': 'Фламиш',
  'French Lentils With Garlic and Thyme': 'Френска леща с чесън и мащерка',
  'Garides Saganaki': 'Гаридес Саганаки',
  'Grilled Mac and Cheese Sandwich': 'Препечен сандвич с макарони',
  'Ham hridge': 'Шунков бридж',
  'Irish Stew': 'Ирландска яхния',
  'Jamaican Jerk Chicken': 'Ямайско пикантно пиле',
  'Jerk Chicken with Rice & Peas': 'Пикантно пиле с ориз и грах',
  'Kafteji': 'Кафтеджи',
  'Kapsalon': 'Капсалон',
  'Kedgeree': 'Кеджери',
  'Kentucky Fried Chicken': 'Кентъки пържено пиле',
  'Kumpir': 'Кумпир',
  'Lamb and Potato Casserole': 'Запеканка с агнешко и картофи',
  'Lamb and Lemon Souvlaki': 'Агнешки сувлаки с лимон',
  'Lamb Tomato and Sweet Spices': 'Агнешко с домати и сладки подправки',
  'Ma Po Tofu': 'Ма По Тофу',
  'Mediterranean Pasta Salad': 'Средиземноморска салата с паста',
  'Montreal Smoked Meat': 'Монреалско пушено месо',
  'Mushroom Risotto': 'Ризото с гъби',
  'Nutella Crepes': 'Крепи с Нутела',
  'Pancakes American Style': 'Американски палачинки',
  'Pate Chinois': 'Пате Шиноа',
  'Peanut Butter Cookies': 'Бисквити с фъстъчено масло',
  'Pilchard puttanesca': 'Путанеска със сардини',
  'Polish Pancakes': 'Полски палачинки',
  'Portuguese Custard Tarts': 'Португалски тарталетки',
  'Poulet DG': 'Пиле ДГ',
  'Prawn Curry': 'Къри със скариди',
  'Piri-piri Chicken and Slaw': 'Пири-пири пиле и зелева салата',
  'Rappie Pie': 'Пай Рапие',
  'Rogaliki (Polish Croissant Cookies)': 'Рогалики (Полски кроасанчета)',
  'Rosemary Roasted Chicken': 'Печено пиле с розмарин',
  'Salmon Avocado Salad': 'Салата със сьомга и авокадо',
  'Shakshuka': 'Шакшука',
  'Spicy Arrabiata Penne': 'Пикантно пене Арабиата',
  'Spicy North African Shakshuka': 'Пикантна Африканска шакшука',
  'Stuffed Lamb Tomatoes': 'Пълнени домати с агнешко',
  'Sugar Pie': 'Захарен пай',
  'Thai Fried Rice': 'Тайландски пържен ориз',
  'Tonkatsu pork': 'Тонкацу свинско',
  'Tunisian Lamb Soup': 'Тунизийска агнешка супа',
  'Turkish Pide': 'Турски пиде',
  'Venetian Duck Ragu': 'Венециански рагу с патица',
  'Vietnamese Grilled Pork': 'Виетнамско печено свинско',
  'Walnut Roll Gužvara': 'Руло с орехи Гужвара',
  'White chocolate creme brulee': 'Крем брюле с бял шоколад',

  // === Pickled & Misc that MealDB returns ===
  'Red Onion Pickle': 'Маринован червен лук',
  'Onion Pickle': 'Маринован лук',
  'Pickle': 'Туршия',
  'Pickles': 'Туршии',
  'Norwegian Fiskesuppe': 'Норвежка рибена супа',
};

// Word-by-word translation dictionary for titles NOT found in exact match
const WORD_TRANSLATIONS: Record<string, string> = {
  // Proteins
  'Chicken': 'Пиле', 'chicken': 'пиле',
  'Beef': 'Телешко', 'beef': 'телешко',
  'Pork': 'Свинско', 'pork': 'свинско',
  'Lamb': 'Агнешко', 'lamb': 'агнешко',
  'Fish': 'Риба', 'fish': 'риба',
  'Salmon': 'Сьомга', 'salmon': 'сьомга',
  'Tuna': 'Тон', 'tuna': 'тон',
  'Shrimp': 'Скариди', 'shrimp': 'скариди',
  'Prawn': 'Скарида', 'prawn': 'скарида', 'Prawns': 'Скариди', 'prawns': 'скариди',
  'Duck': 'Патица', 'duck': 'патица',
  'Turkey': 'Пуйка', 'turkey': 'пуйка',
  'Veal': 'Телешко', 'veal': 'телешко',
  'Sausage': 'Наденица', 'sausage': 'наденица', 'Sausages': 'Наденици',
  'Bacon': 'Бекон', 'bacon': 'бекон',
  'Ham': 'Шунка', 'ham': 'шунка',
  'Egg': 'Яйце', 'egg': 'яйце', 'Eggs': 'Яйца', 'eggs': 'яйца',
  'Tofu': 'Тофу', 'tofu': 'тофу',
  'Seafood': 'Морски дарове', 'seafood': 'морски дарове',
  'Goat': 'Козе месо', 'goat': 'козе',
  'Crab': 'Рак', 'crab': 'рак',
  'Lobster': 'Омар', 'lobster': 'омар',
  'Meatballs': 'Кюфтенца', 'meatballs': 'кюфтенца',
  'Meatball': 'Кюфтенце', 'meatball': 'кюфтенце',
  'Steak': 'Стек', 'steak': 'стек',
  'Fillet': 'Филе', 'fillet': 'филе',
  'Breast': 'Филе', 'breast': 'филе',
  'Thigh': 'Бутче', 'thigh': 'бутче', 'Thighs': 'Бутчета', 'thighs': 'бутчета',
  'Wing': 'Крило', 'wing': 'крило', 'Wings': 'Крила', 'wings': 'крила',
  'Ribs': 'Ребра', 'ribs': 'ребра', 'Rib': 'Ребро',
  'Liver': 'Дроб', 'liver': 'дроб',
  'Pilchard': 'Сардина', 'pilchard': 'сардина',
  
  // Vegetables
  'Potato': 'Картоф', 'potato': 'картоф', 'Potatoes': 'Картофи', 'potatoes': 'картофи',
  'Tomato': 'Домат', 'tomato': 'домат', 'Tomatoes': 'Домати', 'tomatoes': 'домати',
  'Onion': 'Лук', 'onion': 'лук', 'Onions': 'Лук',
  'Garlic': 'Чесън', 'garlic': 'чесън',
  'Carrot': 'Морков', 'carrot': 'морков', 'Carrots': 'Моркови',
  'Mushroom': 'Гъби', 'mushroom': 'гъби', 'Mushrooms': 'Гъби', 'mushrooms': 'гъби',
  'Pepper': 'Пипер', 'pepper': 'пипер', 'Peppers': 'Чушки', 'peppers': 'чушки',
  'Spinach': 'Спанак', 'spinach': 'спанак',
  'Broccoli': 'Броколи', 'broccoli': 'броколи',
  'Pea': 'Грах', 'pea': 'грах', 'Peas': 'Грах', 'peas': 'грах',
  'Bean': 'Боб', 'bean': 'боб', 'Beans': 'Боб', 'beans': 'боб',
  'Lentil': 'Леща', 'lentil': 'леща', 'Lentils': 'Леща', 'lentils': 'леща',
  'Corn': 'Царевица', 'corn': 'царевица',
  'Cabbage': 'Зеле', 'cabbage': 'зеле',
  'Leek': 'Праз', 'leek': 'праз',
  'Beetroot': 'Цвекло', 'beetroot': 'цвекло',
  'Avocado': 'Авокадо', 'avocado': 'авокадо',
  'Courgette': 'Тиквичка', 'courgette': 'тиквичка',
  'Zucchini': 'Тиквичка', 'zucchini': 'тиквичка',
  'Aubergine': 'Патладжан', 'aubergine': 'патладжан',
  'Eggplant': 'Патладжан', 'eggplant': 'патладжан',
  'Pumpkin': 'Тиква', 'pumpkin': 'тиква',
  'Squash': 'Тиква', 'squash': 'тиква',
  'Artichoke': 'Артишок', 'artichoke': 'артишок',
  'Asparagus': 'Аспержи', 'asparagus': 'аспержи',
  'Cauliflower': 'Карфиол', 'cauliflower': 'карфиол',
  'Celery': 'Целина', 'celery': 'целина',
  'Vegetable': 'Зеленчуков', 'vegetable': 'зеленчуков', 'Vegetables': 'Зеленчуци',
  
  // Fruits
  'Apple': 'Ябълка', 'apple': 'ябълка', 'Apples': 'Ябълки',
  'Banana': 'Банан', 'banana': 'банан', 'Bananas': 'Банани',
  'Lemon': 'Лимон', 'lemon': 'лимон',
  'Orange': 'Портокал', 'orange': 'портокалов',
  'Lime': 'Лайм', 'lime': 'лайм',
  'Berry': 'Горски плодове', 'berry': 'горски плодове',
  'Blackberry': 'Къпина', 'blackberry': 'къпини',
  'Blueberry': 'Боровинка', 'blueberry': 'боровинки',
  'Strawberry': 'Ягода', 'strawberry': 'ягоди', 'Strawberries': 'Ягоди',
  'Raspberry': 'Малина', 'raspberry': 'малини',
  'Peach': 'Праскова', 'peach': 'праскова',
  'Cherry': 'Череша', 'cherry': 'череша', 'Cherries': 'Череши',
  'Plum': 'Слива', 'plum': 'слива',
  'Pear': 'Круша', 'pear': 'круша',
  'Fig': 'Смокиня', 'fig': 'смокиня',
  'Date': 'Фурма', 'date': 'фурма',
  
  // Grains & Carbs
  'Rice': 'Ориз', 'rice': 'ориз',
  'Pasta': 'Паста', 'pasta': 'паста',
  'Noodles': 'Нудли', 'noodles': 'нудли', 'Noodle': 'Нудли',
  'Bread': 'Хляб', 'bread': 'хляб',
  'Toast': 'Тост', 'toast': 'тост',
  'Pie': 'Пай', 'pie': 'пай',
  'Tart': 'Тарт', 'tart': 'тарт',
  'Cake': 'Торта', 'cake': 'торта',
  'Cookie': 'Бисквита', 'cookie': 'бисквита', 'Cookies': 'Бисквити', 'cookies': 'бисквити',
  'Muffin': 'Мъфин', 'muffin': 'мъфин', 'Muffins': 'Мъфини',
  'Pancake': 'Палачинка', 'pancake': 'палачинка',
  'Waffle': 'Гофрета', 'waffle': 'гофрета',
  'Roll': 'Руло', 'roll': 'руло', 'Rolls': 'Рулца',
  'Wrap': 'Рап', 'wrap': 'рап',
  'Bun': 'Кифличка', 'bun': 'кифличка', 'Buns': 'Кифлички',
  'Dumpling': 'Кнедла', 'dumpling': 'кнедла',
  'Crumble': 'Крамбъл', 'crumble': 'крамбъл',
  'Pudding': 'Пудинг', 'pudding': 'пудинг',
  'Porridge': 'Каша', 'porridge': 'каша',
  'Cobbler': 'Коблер', 'cobbler': 'коблер',
  
  // Cooking methods
  'Roast': 'Печен', 'roast': 'печен', 'Roasted': 'Печен', 'roasted': 'печен',
  'Grilled': 'На скара', 'grilled': 'на скара',
  'Fried': 'Пържен', 'fried': 'пържен',
  'Baked': 'Печен', 'baked': 'печен',
  'Steamed': 'На пара', 'steamed': 'на пара',
  'Braised': 'Задушен', 'braised': 'задушен',
  'Smoked': 'Пушен', 'smoked': 'пушен',
  'Stuffed': 'Пълнен', 'stuffed': 'пълнен',
  'Crispy': 'Хрупкав', 'crispy': 'хрупкав',
  'Creamy': 'Кремообразен', 'creamy': 'кремообразен',
  'Spicy': 'Пикантен', 'spicy': 'пикантен',
  'Sweet': 'Сладък', 'sweet': 'сладък',
  'Sour': 'Кисел', 'sour': 'кисел',
  'Glazed': 'Глазиран', 'glazed': 'глазиран',
  'Marinated': 'Мариниран', 'marinated': 'мариниран',
  
  // Dairy & Cheese
  'Cheese': 'Сирене', 'cheese': 'сирене',
  'Cream': 'Сметана', 'cream': 'сметана',
  'Butter': 'Масло', 'butter': 'масло',
  'Milk': 'Мляко', 'milk': 'мляко',
  'Yogurt': 'Кисело мляко', 'yogurt': 'кисело мляко',
  
  // Seasonings
  'Honey': 'Мед', 'honey': 'мед',
  'Ginger': 'Джинджифил', 'ginger': 'джинджифил',
  'Rosemary': 'Розмарин', 'rosemary': 'розмарин',
  'Thyme': 'Мащерка', 'thyme': 'мащерка',
  'Basil': 'Босилек', 'basil': 'босилек',
  'Cinnamon': 'Канела', 'cinnamon': 'канела',
  'Chocolate': 'Шоколад', 'chocolate': 'шоколад',
  'Vanilla': 'Ванилия', 'vanilla': 'ванилия',
  'Nutella': 'Нутела',
  'Peanut': 'Фъстъчен', 'peanut': 'фъстъчен',
  'Walnut': 'Орех', 'walnut': 'орехов', 'Walnuts': 'Орехи',
  'Almond': 'Бадем', 'almond': 'бадемов', 'Almonds': 'Бадеми',
  'Coconut': 'Кокос', 'coconut': 'кокосов',
  'Saffron': 'Шафран', 'saffron': 'шафранов',
  
  // Dish types
  'Soup': 'Супа', 'soup': 'супа',
  'Salad': 'Салата', 'salad': 'салата',
  'Stew': 'Яхния', 'stew': 'яхния',
  'Curry': 'Къри', 'curry': 'къри',
  'Risotto': 'Ризото', 'risotto': 'ризото',
  'Casserole': 'Запеканка', 'casserole': 'запеканка',
  'Hotpot': 'Гювеч', 'hotpot': 'гювеч',
  'Ragu': 'Рагу', 'ragu': 'рагу',
  'Ragout': 'Рагу', 'ragout': 'рагу',
  'Chowder': 'Гъста супа', 'chowder': 'гъста супа',
  'Broth': 'Бульон', 'broth': 'бульон',
  'Sandwich': 'Сандвич', 'sandwich': 'сандвич',
  'Burger': 'Бургер', 'burger': 'бургер',
  'Bowl': 'Купичка', 'bowl': 'купичка',
  'Pot': 'Гърне', 'pot': 'гърне',
  'Platter': 'Плато', 'platter': 'плато',
  'Tartlets': 'Тарталетки', 'tartlets': 'тарталетки',
  'Tarts': 'Тартове', 'tarts': 'тартове',
  
  // Prepositions / connectors
  'and': 'и',
  'with': 'с',
  'in': 'в',
  'on': 'на',
  'of': '',
  'the': '',
  'a': '',
  'an': '',
  'au': 'с',
  'alla': 'по',
  'al': '',
  'de': '',
  'la': '',
  'le': '',
  'du': '',
  'en': '',
  'con': 'с',
  'Style': 'стил',
  'style': 'стил',
  
  // Regions/nationalities used in recipe names
  'French': 'Френски', 'french': 'френски',
  'Italian': 'Италиански', 'italian': 'италиански',
  'Greek': 'Гръцки', 'greek': 'гръцки',
  'Thai': 'Тайландски', 'thai': 'тайландски',
  'Chinese': 'Китайски', 'chinese': 'китайски',
  'Japanese': 'Японски', 'japanese': 'японски',
  'Indian': 'Индийски', 'indian': 'индийски',
  'Mexican': 'Мексикански', 'mexican': 'мексикански',
  'American': 'Американски', 'american': 'американски',
  'British': 'Британски', 'british': 'британски',
  'Spanish': 'Испански', 'spanish': 'испански',
  'Portuguese': 'Португалски', 'portuguese': 'португалски',
  'Polish': 'Полски', 'polish': 'полски',
  'Irish': 'Ирландски', 'irish': 'ирландски',
  'Dutch': 'Холандски', 'dutch': 'холандски',
  'Vietnamese': 'Виетнамски', 'vietnamese': 'виетнамски',
  'Korean': 'Корейски', 'korean': 'корейски',
  'Moroccan': 'Марокански', 'moroccan': 'марокански',
  'Turkish': 'Турски', 'turkish': 'турски',
  'Egyptian': 'Египетски', 'egyptian': 'египетски',
  'Tunisian': 'Тунизийски', 'tunisian': 'тунизийски',
  'Jamaican': 'Ямайски', 'jamaican': 'ямайски',
  'Canadian': 'Канадски', 'canadian': 'канадски',
  'Croatian': 'Хърватски', 'croatian': 'хърватски',
  'Russian': 'Руски', 'russian': 'руски',
  'Ukrainian': 'Украински', 'ukrainian': 'украински',
  'Mediterranean': 'Средиземноморски', 'mediterranean': 'средиземноморски',
  'Venetian': 'Венециански', 'venetian': 'венециански',
  'Provencal': 'Провансалски', 'provencal': 'провансалски',
  'North': 'Северно', 'north': 'северно',
  'African': 'Африкански', 'african': 'африкански',
  'Jerk': 'Пикантно', 'jerk': 'пикантно',
  'Norwegian': 'Норвежки', 'norwegian': 'норвежки',
  'New': 'Ново', 'new': 'ново',
  'England': 'Англия', 'england': 'Англия',
  'Red': 'Червен', 'red': 'червен',
  'White': 'Бял', 'white': 'бял',
  'Green': 'Зелен', 'green': 'зелен',
  'Golden': 'Златист', 'golden': 'златист',
  'Hot': 'Горещ', 'hot': 'горещ',
  'Classic': 'Класически', 'classic': 'класически',
  'Traditional': 'Традиционен', 'traditional': 'традиционен',
  'Homemade': 'Домашен', 'homemade': 'домашен',
  'Home-made': 'Домашен',
  'Simple': 'Лесен', 'simple': 'лесен',
  'Quick': 'Бърз', 'quick': 'бърз',
  'Easy': 'Лесен', 'easy': 'лесен',
  'BBQ': 'Барбекю', 'bbq': 'барбекю',
  'Slaw': 'Зелева салата', 'slaw': 'зелева салата',
  'Fudge': 'Фъдж', 'fudge': 'фъдж',
  'Toffee': 'Карамел', 'toffee': 'карамел',
  'Sticky': 'Лепкав', 'sticky': 'лепкав',
  'Spotted': 'Със стафиди',
  'Baby': 'Бебешки', 'baby': 'бебешки',
  'Mini': 'Мини', 'mini': 'мини',
  'Big': 'Голям', 'big': 'голям',
  'Vegan': 'Веганско', 'vegan': 'веганско',
  'Vegetarian': 'Вегетарианско', 'vegetarian': 'вегетарианско',
};

// Translation cache for runtime
const titleTranslationCache: Record<string, string> = {};

/**
 * Translates a recipe title to Bulgarian.
 * 1. First checks exact match dictionary
 * 2. Then does word-by-word translation with longest-match-first
 * 3. Caches result for performance
 */
function translateRecipeTitle(title: string, language: string): string {
  if (language !== 'bg') return title;
  if (!title) return title;
  
  // Check cache
  if (titleTranslationCache[title]) return titleTranslationCache[title];
  
  // 1. Exact match
  if (EXACT_TITLE_TRANSLATIONS[title]) {
    titleTranslationCache[title] = EXACT_TITLE_TRANSLATIONS[title];
    return EXACT_TITLE_TRANSLATIONS[title];
  }
  
  // 2. Case-insensitive exact match
  const titleLower = title.toLowerCase();
  for (const [key, val] of Object.entries(EXACT_TITLE_TRANSLATIONS)) {
    if (key.toLowerCase() === titleLower) {
      titleTranslationCache[title] = val;
      return val;
    }
  }
  
  // 3. Word-by-word translation (longest phrases first)
  let result = title;
  const sortedWords = Object.entries(WORD_TRANSLATIONS)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [en, bg] of sortedWords) {
    if (!bg) continue; // skip empty translations
    // Use word boundary regex to avoid partial word matches
    const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'g');
    result = result.replace(regex, bg);
  }
  
  // Clean up: remove double spaces, trim
  result = result.replace(/\s+/g, ' ').trim();
  
  // If nothing changed, return original
  titleTranslationCache[title] = result;
  return result;
}


// ============================================================
// MealDB DATA FETCHING (with deduplication)
// ============================================================

const convertMealDBRecipe = (meal: any): Recipe => {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push({ name: ing.trim(), amount: 1, unit: measure?.trim() || '' });
    }
  }

  const steps = (meal.strInstructions || '')
    .split(/\r\n|\n/)
    .filter((s: string) => s.trim())
    .map((s: string) => s.trim());

  return {
    _id: `mealdb_${meal.idMeal}`,
    title: meal.strMeal,
    description: `${meal.strCategory || ''} - ${meal.strArea || ''}`,
    mainImage: meal.strMealThumb,
    prepTime: 15,
    cookTime: 30,
    servings: 1, // Always 1 for API recipes — base portion
    tags: [meal.strCategory?.toLowerCase(), meal.strArea?.toLowerCase()].filter(Boolean),
    nutrition: { calories: 300 + Math.floor(Math.random() * 200) },
    ingredients,
    steps,
    isFromAPI: true,
  };
};

const fetchMealDBByCategory = async (category: string): Promise<Recipe[]> => {
  try {
    const listRes = await fetch(`${MEALDB_PROXY}/filter/category/${encodeURIComponent(category)}`);
    if (!listRes.ok) return [];
    
    const listData = await listRes.json();
    if (!listData.meals) return [];

    const meals = listData.meals.slice(0, 24);
    const seen = new Set<string>();
    const recipes: Recipe[] = [];

    const detailsPromises = meals.map((m: any) =>
      fetch(`${MEALDB_PROXY}/lookup/${m.idMeal}`)
        .then(r => r.json())
        .catch(() => null)
    );
    
    const details = await Promise.all(detailsPromises);
    for (const d of details) {
      if (d?.meals?.[0]) {
        const id = d.meals[0].idMeal;
        if (!seen.has(id)) {
          seen.add(id);
          recipes.push(convertMealDBRecipe(d.meals[0]));
        }
      }
    }
    return recipes;
  } catch (error) {
    console.error('[Feed] MealDB category error:', error);
    return [];
  }
};

const fetchMealDBRandom = async (count: number = 12): Promise<Recipe[]> => {
  try {
    const recipes: Recipe[] = [];
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();
    
    // Request more than needed to account for duplicates
    const maxAttempts = count * 3;
    let attempts = 0;
    const batchSize = 4;
    
    while (recipes.length < count && attempts < maxAttempts) {
      const batchPromises = Array(Math.min(batchSize, count - recipes.length + 2)).fill(null).map(() =>
        fetch(`${MEALDB_PROXY}/random`)
          .then(r => r.json())
          .catch(() => null)
      );
      const batchResults = await Promise.all(batchPromises);
      
      for (const r of batchResults) {
        if (r?.meals?.[0]) {
          const meal = r.meals[0];
          const id = meal.idMeal;
          const titleNorm = meal.strMeal?.toLowerCase().trim();
          
          // Skip if we already have this recipe (by ID or title)
          if (!seenIds.has(id) && !seenTitles.has(titleNorm)) {
            seenIds.add(id);
            seenTitles.add(titleNorm);
            recipes.push(convertMealDBRecipe(meal));
          }
        }
        attempts++;
      }
      
      // Small delay between batches
      if (recipes.length < count) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return recipes;
  } catch (error) {
    console.error('[Feed] MealDB random error:', error);
    return [];
  }
};

const searchMealDB = async (query: string): Promise<Recipe[]> => {
  try {
    const res = await fetch(`${MEALDB_PROXY}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.meals) return [];
    
    // Deduplicate search results by ID
    const seen = new Set<string>();
    return data.meals
      .filter((m: any) => {
        if (seen.has(m.idMeal)) return false;
        seen.add(m.idMeal);
        return true;
      })
      .map(convertMealDBRecipe);
  } catch (error) {
    console.error('[Feed] MealDB search error:', error);
    return [];
  }
};

// Fallback recipes with REAL MealDB IDs
const FALLBACK_FEED_RECIPES: Recipe[] = [
  { _id: 'mealdb_52982', title: 'Spaghetti Carbonara', mainImage: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg', prepTime: 10, cookTime: 20, servings: 1, nutrition: { calories: 520 }, isFromAPI: true, tags: ['pasta'] },
  { _id: 'mealdb_52940', title: 'Chicken Curry', mainImage: 'https://www.themealdb.com/images/media/meals/1525876468.jpg', prepTime: 20, cookTime: 40, servings: 1, nutrition: { calories: 420 }, isFromAPI: true, tags: ['chicken'] },
  { _id: 'mealdb_52878', title: 'Beef and Mustard Pie', mainImage: 'https://www.themealdb.com/images/media/meals/sytuqu1511553755.jpg', prepTime: 30, cookTime: 120, servings: 1, nutrition: { calories: 380 }, isFromAPI: true, tags: ['beef'] },
  { _id: 'mealdb_52802', title: 'Fish and Chips', mainImage: 'https://www.themealdb.com/images/media/meals/1550441275.jpg', prepTime: 20, cookTime: 30, servings: 1, nutrition: { calories: 550 }, isFromAPI: true, tags: ['seafood'] },
  { _id: 'mealdb_52854', title: 'Pancakes', mainImage: 'https://www.themealdb.com/images/media/meals/rwuyqx1511383174.jpg', prepTime: 10, cookTime: 15, servings: 1, nutrition: { calories: 280 }, isFromAPI: true, tags: ['breakfast'] },
  { _id: 'mealdb_52776', title: 'Chocolate Gateau', mainImage: 'https://www.themealdb.com/images/media/meals/tqtywx1468317395.jpg', prepTime: 30, cookTime: 35, servings: 1, nutrition: { calories: 450 }, isFromAPI: true, tags: ['dessert'] },
  { _id: 'mealdb_52771', title: 'Greek Salad', mainImage: 'https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg', prepTime: 15, cookTime: 0, servings: 1, nutrition: { calories: 180 }, isFromAPI: true, tags: ['vegetarian'] },
  { _id: 'mealdb_53065', title: 'Sushi', mainImage: 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg', prepTime: 30, cookTime: 0, servings: 1, nutrition: { calories: 350 }, isFromAPI: true, tags: ['seafood'] },
];

// ============================================================
// DEDUPLICATION UTILITY
// ============================================================

/** Deduplicates recipes by _id and normalized title */
function deduplicateRecipes(recipes: Recipe[]): Recipe[] {
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const unique: Recipe[] = [];
  
  for (const recipe of recipes) {
    const id = recipe._id;
    const titleNorm = recipe.title?.toLowerCase().trim() || '';
    
    if (seenIds.has(id) || seenTitles.has(titleNorm)) {
      continue; // skip duplicate
    }
    
    seenIds.add(id);
    if (titleNorm) seenTitles.add(titleNorm);
    unique.push(recipe);
  }
  
  return unique;
}


// ============================================================
// RECIPE CARD COMPONENT
// ============================================================

function RecipeCard({ recipe, language }: { recipe: Recipe; language: string }) {
  const { isAuthenticated } = useAuthStore();
  const [isFav, setIsFav] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error(language === 'bg' ? 'Влез в профила си' : 'Please login first');
      return;
    }

    setSaving(true);
    try {
      let recipeId = recipe._id;
      if (recipe.isFromAPI) {
        const formattedIngredients = (recipe.ingredients || []).map(ing => ({
          name: String(ing.name || 'Съставка').trim() || 'Съставка',
          amount: typeof ing.amount === 'number' && ing.amount > 0 ? ing.amount : 1,
          unit: String(ing.unit || '').trim() || 'бр.'
        }));
        if (formattedIngredients.length === 0) {
          formattedIngredients.push({ name: 'Съставка', amount: 1, unit: 'бр.' });
        }

        let description = recipe.description || '';
        if (description.length < 10) {
          description = `${recipe.title} - вкусна рецепта от TheMealDB. Опитайте!`;
        }

        let steps = recipe.steps || [];
        steps = steps.filter(s => s && s.trim()).map(s => s.trim());
        if (steps.length === 0) {
          steps = ['Следвайте инструкциите за приготвяне.'];
        }

        const mainImage = recipe.mainImage && recipe.mainImage.startsWith('http') 
          ? recipe.mainImage 
          : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

        const saved = await recipeApi.createRecipe({
          title: recipe.title || 'Рецепта',
          description,
          mainImage,
          prepTime: recipe.prepTime || 15,
          cookTime: recipe.cookTime || 30,
          servings: recipe.servings || 1,
          ingredients: formattedIngredients,
          steps,
          tags: [],
          nutrition: {
            calories: recipe.nutrition?.calories || 300,
            protein: 20,
            carbs: 30,
            fat: 15,
          },
        });
        recipeId = saved.recipe._id;
      }
      const result = await favoriteApi.toggleFavorite(recipeId);
      setIsFav(result.isFavorited);
      toast.success(result.isFavorited ? (language === 'bg' ? 'Добавено!' : 'Added!') : (language === 'bg' ? 'Премахнато' : 'Removed'));
    } catch (err: any) {
      console.error('Favorite error:', err);
      toast.error(err.response?.data?.message || (language === 'bg' ? 'Грешка' : 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const link = recipe.isFromAPI ? `/recipes/api/${recipe._id}` : `/recipes/${recipe._id}`;

  return (
    <Link to={link}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-wood-800 rounded-2xl overflow-hidden border-2 border-orange-200 dark:border-wood-600 hover:border-orange-400 dark:hover:border-forest-500 hover:shadow-lg transition-all group select-none"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={recipe.mainImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform pointer-events-none"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          
          {isAuthenticated && (
            <button
              onClick={handleFavorite}
              disabled={saving}
              className={cn(
                'absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all',
                isFav ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
              )}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={cn('w-5 h-5', isFav && 'fill-current')} />}
            </button>
          )}
          
          {recipe.isFromAPI && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Globe className="w-3 h-3" />
              MealDB
            </div>
          )}

          {recipe.nutrition?.calories && (
            <div className="absolute bottom-16 right-3 px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {recipe.nutrition.calories} kcal
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-serif font-bold text-white line-clamp-2">
              {translateRecipeTitle(recipe.title, language)}
            </h3>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-cream-400">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {totalTime} {language === 'bg' ? 'мин' : 'min'}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {recipe.servings} {language === 'bg' ? (recipe.servings === 1 ? 'порция' : 'порции') : (recipe.servings === 1 ? 'serving' : 'servings')}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}


// ============================================================
// MAIN FEED COMPONENT
// ============================================================

export default function Feed() {
  const { isAuthenticated } = useAuthStore();
  const { language } = useThemeStore();
  const location = useLocation();
  
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadKey, setLoadKey] = useState(0);

  const t = {
    title: language === 'bg' ? 'Рецепти' : 'Recipes',
    subtitle: language === 'bg' ? 'Открий вкусни рецепти от цял свят' : 'Discover delicious recipes',
    addRecipe: language === 'bg' ? 'Добави рецепта' : 'Add Recipe',
    search: language === 'bg' ? 'Търси рецепти...' : 'Search recipes...',
    regions: language === 'bg' ? 'Региони' : 'Regions',
    loading: language === 'bg' ? 'Зареждане...' : 'Loading...',
    noRecipes: language === 'bg' ? 'Няма рецепти' : 'No recipes',
    all: language === 'bg' ? 'Всички' : 'All',
    breakfast: language === 'bg' ? 'Закуска' : 'Breakfast',
    dessert: language === 'bg' ? 'Десерт' : 'Dessert',
    vegetarian: language === 'bg' ? 'Вегетариански' : 'Vegetarian',
    seafood: language === 'bg' ? 'Морски дарове' : 'Seafood',
    chicken: language === 'bg' ? 'Пиле' : 'Chicken',
    beef: language === 'bg' ? 'Телешко' : 'Beef',
    pasta: language === 'bg' ? 'Паста' : 'Pasta',
    page: language === 'bg' ? 'Страница' : 'Page',
  };

  const TAGS = [
    { id: 'all', label: t.all },
    { id: 'breakfast', label: t.breakfast },
    { id: 'dessert', label: t.dessert },
    { id: 'vegetarian', label: t.vegetarian },
    { id: 'seafood', label: t.seafood },
    { id: 'chicken', label: t.chicken },
    { id: 'beef', label: t.beef },
    { id: 'pasta', label: t.pasta },
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    setCurrentPage(1);
    
    try {
      const allRecipes: Recipe[] = [];

      // Get user recipes
      try {
        const userData = await recipeApi.getAll({ limit: 50 });
        if (userData?.recipes) {
          allRecipes.push(...userData.recipes);
        }
      } catch (e) {
        // No user recipes or error — continue
      }

      // Get API recipes
      let apiRecipes: Recipe[] = [];
      
      if (search) {
        apiRecipes = await searchMealDB(search);
      } else if (selectedTag !== 'all') {
        const category = CATEGORY_MAP[selectedTag];
        if (category) {
          apiRecipes = await fetchMealDBByCategory(category);
        }
      } else {
        apiRecipes = await fetchMealDBRandom(24);
      }

      allRecipes.push(...apiRecipes);

      // If we have very few recipes, add fallback
      if (allRecipes.length < 3 && !search) {
        allRecipes.push(...FALLBACK_FEED_RECIPES);
      }

      // *** KEY FIX: Deduplicate everything by _id AND title ***
      const uniqueRecipes = deduplicateRecipes(allRecipes);

      setRecipes(uniqueRecipes);
    } catch (error) {
      console.error('[Feed] Error loading:', error);
      setRecipes(deduplicateRecipes(FALLBACK_FEED_RECIPES));
    } finally {
      setLoading(false);
    }
  }, [selectedTag, search]);

  useEffect(() => {
    loadData();
  }, [loadData, loadKey, location.key]);

  const handleRefresh = () => {
    setLoadKey(prev => prev + 1);
  };

  // Pagination
  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);
  const paginatedRecipes = recipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 select-none">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-cream-100 mb-1">
              {t.title}
            </h1>
            <p className="text-gray-600 dark:text-cream-400">{t.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Link
                to="/recipes/create"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                {t.addRecipe}
              </Link>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-3 rounded-xl bg-orange-100 dark:bg-wood-700 text-orange-600 dark:text-forest-400 hover:bg-orange-200 dark:hover:bg-wood-600 transition-colors"
              title={language === 'bg' ? 'Презареди' : 'Refresh'}
            >
              
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-orange-200 dark:border-wood-600 bg-white dark:bg-wood-800 text-gray-800 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-forest-500 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Regions */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-cream-300 mb-2">{t.regions}</p>
          <div className="flex flex-wrap gap-2">
            {ALL_REGIONS.map((region) => (
              <Link
                key={region.id}
                to={`/regions/${region.id}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-orange-50 dark:bg-wood-700 text-orange-700 dark:text-cream-200 hover:bg-orange-100 dark:hover:bg-forest-900/30 border border-orange-200 dark:border-wood-600 flex items-center gap-2"
              >
                <span>{region.flag}</span>
                {language === 'bg' ? region.nameBg : region.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Category Tags */}
        <div className="hidden">
          {TAGS.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                selectedTag === tag.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 text-white shadow-lg'
                  : 'bg-orange-50 dark:bg-wood-700 text-gray-700 dark:text-cream-200 hover:bg-orange-100 dark:hover:bg-forest-900/30 border border-orange-200 dark:border-wood-600'
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 dark:text-forest-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-cream-400">{t.loading}</p>
        </div>
      )}

      {/* No recipes */}
      {!loading && recipes.length === 0 && (
        <div className="text-center py-20 bg-orange-50 dark:bg-wood-800 rounded-2xl">
          <ChefHat className="w-16 h-16 text-orange-300 dark:text-wood-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-cream-100">{t.noRecipes}</h3>
        </div>
      )}

      {/* Recipes Grid */}
      {!loading && paginatedRecipes.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedRecipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} language={language} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  currentPage === 1
                    ? 'text-gray-300 dark:text-wood-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-cream-300 hover:bg-orange-100 dark:hover:bg-wood-700'
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={cn(
                    'w-10 h-10 rounded-lg font-semibold transition-all',
                    currentPage === page
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 text-white shadow-lg'
                      : 'bg-orange-50 dark:bg-wood-700 text-gray-700 dark:text-cream-200 hover:bg-orange-100 dark:hover:bg-wood-600'
                  )}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  currentPage === totalPages
                    ? 'text-gray-300 dark:text-wood-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-cream-300 hover:bg-orange-100 dark:hover:bg-wood-700'
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
