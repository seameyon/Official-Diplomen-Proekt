import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, Clock, Users, Flame, Check, Loader2,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mealdbApi } from '../../services/mealdb';
import { favoriteApi, recipeApi } from '../../services/api';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { cn } from '../../utils';

// Cache for translations
const translationCache: Record<string, {
  title: string;
  steps: string[];
  ingredients: string[];
}> = {};

// ============================================================
// EXACT TITLE TRANSLATIONS (full recipe names)
// ============================================================
const EXACT_TITLE_TRANSLATIONS: Record<string, string> = {
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
  'Vindaloo': 'Виндалу',
  'Korma': 'Корма',
  'Tikka Masala': 'Тика масала',
  'Chicken Tikka Masala': 'Пиле Тика Масала',
  'Chicken Tikka': 'Пиле Тика',
  'Dumplings': 'Кнедли',
  'Spring Rolls': 'Спринг ролс',
  'Dim Sum': 'Дим сум',
  'Chow Mein': 'Чоу мейн',
  'Mapo Tofu': 'Мапо тофу',
  'Ma Po Tofu': 'Ма По Тофу',
  'General Tso Chicken': 'Пиле Дженерал Цо',
  'Orange Chicken': 'Портокалово пиле',
  'Beef and Broccoli': 'Телешко с броколи',
  'Tempura': 'Темпура',
  'Miso Soup': 'Мисо супа',
  'Udon': 'Удон',
  'Katsu Chicken': 'Пиле Кацу',
  'Chicken Katsu': 'Пиле Кацу',
  'Bulgogi': 'Булгоги',
  'Bibimbap': 'Бибимбап',
  'Kimchi': 'Кимчи',
  'Pho': 'Фо',
  'Tom Yum': 'Том Ям',
  'Tom Yum Goong': 'Том Ям с скариди',
  'Green Curry': 'Зелено къри',
  'Red Curry': 'Червено къри',
  'Massaman Curry': 'Масаман къри',
  'Thai Green Curry': 'Тайландско зелено къри',
  'Roast Chicken': 'Печено пиле',
  'Roast Beef': 'Печено телешко',
  'Grilled Chicken': 'Пиле на скара',
  'Fried Chicken': 'Пържено пиле',
  'Grilled Salmon': 'Сьомга на скара',
  'Shepherd\'s Pie': 'Пастирски пай',
  'Shepherds Pie': 'Пастирски пай',
  'Cottage Pie': 'Домашен пай',
  'Beef and Mustard Pie': 'Пай с телешко и горчица',
  'Steak and Kidney Pie': 'Пай с телешко и бъбреци',
  'Yorkshire Pudding': 'Йоркширски пудинг',
  'Bangers and Mash': 'Наденички с пюре',
  'Toad in the Hole': 'Наденички в тесто',
  'Full English Breakfast': 'Пълна английска закуска',
  'Beef Wellington': 'Телешко Уелингтън',
  'Cornish Pasties': 'Корнуолски пастети',
  'Scotch Eggs': 'Шотландски яйца',
  'Treacle Tart': 'Тарт с меласа',
  'Sticky Toffee Pudding': 'Карамелен пудинг',
  'Bread and Butter Pudding': 'Пудинг с хляб и масло',
  'Quiche Lorraine': 'Киш Лорен',
  'French Onion Soup': 'Френска лучена супа',
  'Nicoise Salad': 'Салата Ница',
  'Tarte Tatin': 'Тарт Татен',
  'Penne Arrabiata': 'Пене Арабиата',
  'Spicy Arrabiata Penne': 'Пикантно пене Арабиата',
  'Fettuccine Alfredo': 'Фетучини Алфредо',
  'Gnocchi': 'Ньоки',
  'Bruschetta': 'Брускета',
  'Panna Cotta': 'Пана Кота',
  'Calzone': 'Калцоне',
  'Lamb Biryani': 'Агнешко бирияни',
  'Chicken Biryani': 'Пилешко бирияни',
  'Palak Paneer': 'Палак панир',
  'Chana Masala': 'Чана масала',
  'Chicken Madras': 'Пиле Мадрас',
  'Chicken Jalfrezi': 'Пиле Джалфрези',
  'Lamb Rogan Josh': 'Агнешко Роган Джош',
  'Onion Bhaji': 'Бхаджи с лук',
  'Tabbouleh': 'Табуле',
  'Lamb Tagine': 'Агнешко тажин',
  'Couscous': 'Кускус',
  'Quesadilla': 'Кесадия',
  'Guacamole': 'Гуакамоле',
  'Nachos': 'Начос',
  'Churros': 'Чурос',
  'Fajitas': 'Фахитас',
  'Chili con Carne': 'Чили кон карне',
  'Chilli con Carne': 'Чили кон карне',
  'Souvlaki': 'Сувлаки',
  'Spanakopita': 'Спанакопита',
  'Mac and Cheese': 'Макарони със сирене',
  'Hamburger': 'Хамбургер',
  'Hot Dog': 'Хот дог',
  'Spanish Tortilla': 'Испанска тортия',
  'Tortilla Espanola': 'Испанска тортия',
  'Patatas Bravas': 'Пататас бравас',
  'Schnitzel': 'Шницел',
  'Goulash': 'Гулаш',
  'Apple Strudel': 'Ябълков щрудел',
  'Strudel': 'Щрудел',
  'Mushroom Risotto': 'Ризото с гъби',
  'Tomato Soup': 'Доматена супа',
  'Chicken Soup': 'Пилешка супа',
  'Mushroom Soup': 'Гъбена супа',
  'Pumpkin Soup': 'Тиквена супа',
  'Lentil Soup': 'Леща супа',
  'Onion Soup': 'Лучена супа',
  'Chocolate Mousse': 'Шоколадов мус',
  'Rice Pudding': 'Мляко с ориз',
  'Banana Bread': 'Бананов хляб',
  'Carrot Cake': 'Морковена торта',
  'Red Velvet Cake': 'Торта Червено кадифе',
  'Cinnamon Rolls': 'Канелени рулца',
  'Shakshuka': 'Шакшука',
  'Irish Stew': 'Ирландска яхния',
  'Borscht': 'Борш',
  'Pierogi': 'Пироги',
  'Poutine': 'Путин',
  'Bitterballen (Dutch meatballs)': 'Битербален (Холандски кюфтенца)',
  'Bitterballen': 'Битербален',
  'Nutella Crepes': 'Крепи с Нутела',
  'Pancakes American Style': 'Американски палачинки',
  'Banana Pancakes': 'Бананови палачинки',
  'Portuguese Custard Tarts': 'Португалски тарталетки',
  'Prawn Curry': 'Къри със скариди',
  'Honey Teriyaki Salmon': 'Сьомга с мед и терияки',
  'Salmon Teriyaki': 'Сьомга Терияки',
  'Rosemary Roasted Chicken': 'Печено пиле с розмарин',
  'Salmon Avocado Salad': 'Салата със сьомга и авокадо',
  'Thai Fried Rice': 'Тайландски пържен ориз',
  'Tonkatsu pork': 'Тонкацу свинско',
  'Tunisian Lamb Soup': 'Тунизийска агнешка супа',
  'Turkish Pide': 'Турски пиде',
  'Venetian Duck Ragu': 'Венециански рагу с патица',
  'Vietnamese Grilled Pork': 'Виетнамско печено свинско',
  'White chocolate creme brulee': 'Крем брюле с бял шоколад',
  'Red Onion Pickle': 'Маринован червен лук',
  'Norwegian Fiskesuppe': 'Норвежка рибена супа',
  'Egg Drop Soup': 'Супа с яйце',
  'Egyptian Fatteh': 'Египетски фате',
  'Fish Stew with Rouille': 'Рибена яхния с руй',
  'French Lentils With Garlic and Thyme': 'Френска леща с чесън и мащерка',
  'Grilled Mac and Cheese Sandwich': 'Препечен сандвич с макарони',
  'Jamaican Jerk Chicken': 'Ямайско пикантно пиле',
  'Jerk Chicken with Rice & Peas': 'Пикантно пиле с ориз и грах',
  'Kentucky Fried Chicken': 'Кентъки пържено пиле',
  'Kumpir': 'Кумпир',
  'Lamb and Potato Casserole': 'Запеканка с агнешко и картофи',
  'Mediterranean Pasta Salad': 'Средиземноморска салата с паста',
  'Peanut Butter Cookies': 'Бисквити с фъстъчено масло',
  'Piri-piri Chicken and Slaw': 'Пири-пири пиле и зелева салата',
  'Chicken Enchilada Casserole': 'Пилешка енчилада запеканка',
  'Chicken Congee': 'Пилешко конджи',
  'Chicken Couscous': 'Пиле с кускус',
  'Chicken Handi': 'Пиле Ханди',
  'Chicken Karaage': 'Пиле Караге',
  'Chicken Marengo': 'Пиле Маренго',
  'Chicken & mushroom Hotpot': 'Гювеч с пиле и гъби',
  'Cream Cheese Tart': 'Тарт с крема сирене',
  'Stuffed Lamb Tomatoes': 'Пълнени домати с агнешко',
  'Blackberry and Apple Crumble': 'Крамбъл с къпини и ябълки',
  'Apple Crumble': 'Ябълков крамбъл',
  'Lemon Drizzle Cake': 'Лимонена торта',
  'Victoria Sponge': 'Бисквитена торта Виктория',
  'Blueberry Muffins': 'Мъфини с боровинки',
  'Waldorf Salad': 'Салата Валдорф',
  'Potato Salad': 'Картофена салата',
  'Chicken Salad': 'Пилешка салата',
  'Fruit Salad': 'Плодова салата',
  'Air Fryer Egg Rolls': 'Спринг ролс на еър фрайър',
  'Egg Rolls': 'Спринг ролс',
  'Nasi Goreng': 'Наси Горенг',
  'Rendang': 'Ренданг',
  'Laksa': 'Лакса',
  'Satay': 'Сатай',
  'Chicken Satay': 'Пилешки сатай',
  'Beef Rendang': 'Телешко ренданг',
  'Chicken Rendang': 'Пилешко ренданг',
  'Kedgeree': 'Кеджери',
  'Kapsalon': 'Капсалон',
  'Kafteji': 'Кафтеджи',
  'Garides Saganaki': 'Гаридес Саганаки',
  'Flamiche': 'Фламиш',
  'Cassoulet': 'Касуле',
  'Osso Buco': 'Осо буко',
  'Ribollita': 'Риболита',
  'Dal fridge': 'Дал',
  'Sugar Pie': 'Захарен пай',
  'Key Lime Pie': 'Пай с лайм',
  'Pumpkin Pie': 'Тиквен пай',
  'Peach Cobbler': 'Праскова коблер',
  'Eton Mess': 'Итън Мес',
  'Summer Pudding': 'Летен пудинг',
  'Christmas Pudding': 'Коледен пудинг',
  'Treacle Pudding': 'Пудинг с меласа',
  'Spotted Dick': 'Пудинг със стафиди',
  'Bakewell Tart': 'Тарт Бейкуел',
  'Battenberg Cake': 'Торта Батенберг',
  'Madeira Cake': 'Кейк Мадейра',
  'Dundee Cake': 'Кейк Дънди',
  'Eccles Cake': 'Кейк Еклс',
  'Rock Cakes': 'Скални кейкчета',
  'Chelsea Bun': 'Кифличка Челси',
  'Jam Roly-Poly': 'Руло със сладко',
  'Hot Chocolate Fudge': 'Горещ шоколадов фъдж',
  'Mince Pies': 'Коледни питки',
  'Scones': 'Сконове',
  'Rogaliki (Polish Croissant Cookies)': 'Рогалики (Полски кроасанчета)',
  'Polish Pancakes': 'Полски палачинки',
  'Poulet DG': 'Пиле ДГ',
  'Rappie Pie': 'Пай Рапие',
  'Walnut Roll Gužvara': 'Руло с орехи Гужвара',
  'Lamb and Lemon Souvlaki': 'Агнешки сувлаки с лимон',
  'Lamb Tomato and Sweet Spices': 'Агнешко с домати и сладки подправки',
  'Spicy North African Shakshuka': 'Пикантна Африканска шакшука',
  'Montreal Smoked Meat': 'Монреалско пушено месо',
  'Pate Chinois': 'Пате Шиноа',
  'Stamppot': 'Стампот',
  'Dutch Baby Pancake': 'Холандска бебешка палачинка',
  'Chicken Fajita Mac and Cheese': 'Фахита с пиле и макарони',
  'Chicken Alfredo Primavera': 'Пиле Алфредо Примавера',
  'Beef Brisket Pot Roast': 'Печено телешко',
  'Chicken Parmentier': 'Пиле Пармантие',
  'BLT Sandwich': 'БЛТ сандвич',
  'Clam Chowder': 'Супа с миди',
  'New England Clam Chowder': 'Супа с миди Нова Англия',
  'Avgolemono': 'Авголемоно',
  'Pilchard puttanesca': 'Путанеска със сардини',
};

// ============================================================
// WORD-BY-WORD TRANSLATION (for titles not in exact match)
// ============================================================
const WORD_DICT: Record<string, string> = {
  // Proteins
  'Chicken': 'Пиле', 'chicken': 'пиле',
  'Beef': 'Телешко', 'beef': 'телешко',
  'Pork': 'Свинско', 'pork': 'свинско',
  'Lamb': 'Агнешко', 'lamb': 'агнешко',
  'Fish': 'Риба', 'fish': 'риба',
  'Salmon': 'Сьомга', 'salmon': 'сьомга',
  'Tuna': 'Тон', 'tuna': 'тон',
  'Shrimp': 'Скариди', 'shrimp': 'скариди',
  'Prawn': 'Скарида', 'prawn': 'скарида', 'Prawns': 'Скариди',
  'Duck': 'Патица', 'duck': 'патица',
  'Turkey': 'Пуйка', 'turkey': 'пуйка',
  'Sausage': 'Наденица', 'sausage': 'наденица', 'Sausages': 'Наденици',
  'Bacon': 'Бекон', 'bacon': 'бекон',
  'Ham': 'Шунка', 'ham': 'шунка',
  'Egg': 'Яйце', 'egg': 'яйце', 'Eggs': 'Яйца', 'eggs': 'яйца',
  'Tofu': 'Тофу', 'tofu': 'тофу',
  'Seafood': 'Морски дарове', 'seafood': 'морски дарове',
  'Steak': 'Стек', 'steak': 'стек',
  'Fillet': 'Филе', 'fillet': 'филе',
  'Breast': 'Филе', 'breast': 'филе',
  'Thighs': 'Бутчета', 'thighs': 'бутчета',
  'Wings': 'Крила', 'wings': 'крила',
  'Ribs': 'Ребра', 'ribs': 'ребра',
  'Meatballs': 'Кюфтенца', 'meatballs': 'кюфтенца',
  'Ground': 'Кайма', 'ground': 'кайма',
  
  // Vegetables
  'Potato': 'Картоф', 'potato': 'картоф', 'Potatoes': 'Картофи',
  'Tomato': 'Домат', 'tomato': 'домат', 'Tomatoes': 'Домати',
  'Onion': 'Лук', 'onion': 'лук', 'Onions': 'Лук',
  'Garlic': 'Чесън', 'garlic': 'чесън',
  'Carrot': 'Морков', 'carrot': 'морков', 'Carrots': 'Моркови',
  'Mushroom': 'Гъби', 'mushroom': 'гъби', 'Mushrooms': 'Гъби',
  'Pepper': 'Пипер', 'pepper': 'пипер', 'Peppers': 'Чушки',
  'Spinach': 'Спанак', 'spinach': 'спанак',
  'Broccoli': 'Броколи', 'broccoli': 'броколи',
  'Peas': 'Грах', 'peas': 'грах',
  'Beans': 'Боб', 'beans': 'боб',
  'Lentils': 'Леща', 'lentils': 'леща',
  'Cabbage': 'Зеле', 'cabbage': 'зеле',
  'Corn': 'Царевица', 'corn': 'царевица',
  'Avocado': 'Авокадо', 'avocado': 'авокадо',
  'Pumpkin': 'Тиква', 'pumpkin': 'тиква',
  'Cauliflower': 'Карфиол', 'cauliflower': 'карфиол',
  'Vegetable': 'Зеленчуков', 'vegetable': 'зеленчуков', 'Vegetables': 'Зеленчуци',
  'Scallions': 'Зелен лук', 'scallions': 'зелен лук',
  'Ginger': 'Джинджифил', 'ginger': 'джинджифил',
  
  // Fruits
  'Apple': 'Ябълка', 'apple': 'ябълка', 'Apples': 'Ябълки',
  'Banana': 'Банан', 'banana': 'банан',
  'Lemon': 'Лимон', 'lemon': 'лимон',
  'Orange': 'Портокал', 'orange': 'портокалов',
  'Lime': 'Лайм', 'lime': 'лайм',
  'Blackberry': 'Къпина', 'blackberry': 'къпини',
  'Blueberry': 'Боровинка', 'blueberry': 'боровинки',
  'Strawberry': 'Ягода', 'strawberry': 'ягоди',
  'Peach': 'Праскова', 'peach': 'праскова',
  'Cherry': 'Череша', 'cherry': 'череша',
  
  // Grains/Carbs
  'Rice': 'Ориз', 'rice': 'ориз',
  'Pasta': 'Паста', 'pasta': 'паста',
  'Noodles': 'Нудли', 'noodles': 'нудли',
  'Bread': 'Хляб', 'bread': 'хляб',
  'Toast': 'Тост', 'toast': 'тост',
  'Pie': 'Пай', 'pie': 'пай',
  'Tart': 'Тарт', 'tart': 'тарт',
  'Cake': 'Торта', 'cake': 'торта',
  'Cookies': 'Бисквити', 'cookies': 'бисквити',
  'Muffins': 'Мъфини', 'muffins': 'мъфини',
  'Pancake': 'Палачинка', 'pancake': 'палачинка',
  'Roll': 'Руло', 'roll': 'руло', 'Rolls': 'Рулца', 'rolls': 'рулца',
  'Wrap': 'Рап', 'wrap': 'рап',
  'Crumble': 'Крамбъл', 'crumble': 'крамбъл',
  'Pudding': 'Пудинг', 'pudding': 'пудинг',
  'Wrappers': 'Кори', 'wrappers': 'кори',
  
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
  'Glazed': 'Глазиран', 'glazed': 'глазиран',
  
  // Dairy
  'Cheese': 'Сирене', 'cheese': 'сирене',
  'Cream': 'Сметана', 'cream': 'сметана',
  'Butter': 'Масло', 'butter': 'масло',
  'Milk': 'Мляко', 'milk': 'мляко',
  
  // Seasonings
  'Honey': 'Мед', 'honey': 'мед',
  'Rosemary': 'Розмарин', 'rosemary': 'розмарин',
  'Thyme': 'Мащерка', 'thyme': 'мащерка',
  'Cinnamon': 'Канела', 'cinnamon': 'канела',
  'Chocolate': 'Шоколад', 'chocolate': 'шоколад',
  'Vanilla': 'Ванилия', 'vanilla': 'ванилия',
  'Peanut': 'Фъстъчен', 'peanut': 'фъстъчен',
  'Walnut': 'Орехов', 'walnut': 'орехов',
  'Coconut': 'Кокосов', 'coconut': 'кокосов',
  'Soy': 'Соев', 'soy': 'соев',
  'Vinegar': 'Оцет', 'vinegar': 'оцет',
  
  // Dish types
  'Soup': 'Супа', 'soup': 'супа',
  'Salad': 'Салата', 'salad': 'салата',
  'Stew': 'Яхния', 'stew': 'яхния',
  'Curry': 'Къри', 'curry': 'къри',
  'Casserole': 'Запеканка', 'casserole': 'запеканка',
  'Hotpot': 'Гювеч', 'hotpot': 'гювеч',
  'Ragu': 'Рагу', 'ragu': 'рагу',
  'Sandwich': 'Сандвич', 'sandwich': 'сандвич',
  'Burger': 'Бургер', 'burger': 'бургер',
  'Bowl': 'Купичка', 'bowl': 'купичка',
  
  // Connectors
  'and': 'и', 'with': 'с', 'in': 'в', 'on': 'на',
  'of': '', 'the': '', 'a': '', 'an': '',
  'Style': 'стил', 'style': 'стил',
  
  // Nationalities
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
  'Tunisian': 'Тунизийски', 'tunisian': 'тунизийски',
  'Jamaican': 'Ямайски', 'jamaican': 'ямайски',
  'Mediterranean': 'Средиземноморски', 'mediterranean': 'средиземноморски',
  'North': 'Северно', 'north': 'северно',
  'African': 'Африкански', 'african': 'африкански',
  'Norwegian': 'Норвежки', 'norwegian': 'норвежки',
  'Red': 'Червен', 'red': 'червен',
  'White': 'Бял', 'white': 'бял',
  'Green': 'Зелен', 'green': 'зелен',
  'Classic': 'Класически', 'classic': 'класически',
  'Traditional': 'Традиционен', 'traditional': 'традиционен',
  'Homemade': 'Домашен', 'homemade': 'домашен',
  'Air': 'Еър', 'air': 'еър',
  'Fryer': 'Фрайър', 'fryer': 'фрайър',
  'BBQ': 'Барбекю', 'bbq': 'барбекю',
  'Sauce': 'Сос', 'sauce': 'сос',
  'Oil': 'Олио', 'oil': 'олио',
  'Olive': 'Зехтин', 'olive': 'зехтин',
  'Sour': 'Кисел', 'sour': 'кисел',
  'Hot': 'Горещ', 'hot': 'горещ',
  'Filling': 'Пълнеж', 'filling': 'пълнеж',
};

// Title translation cache
const titleCache: Record<string, string> = {};

/**
 * Translates a recipe title to Bulgarian.
 * 1. Exact match
 * 2. Case-insensitive exact match
 * 3. Word-by-word fallback
 */
function translateTitle(title: string): string {
  if (!title) return title;
  if (titleCache[title]) return titleCache[title];
  
  // Exact match
  if (EXACT_TITLE_TRANSLATIONS[title]) {
    titleCache[title] = EXACT_TITLE_TRANSLATIONS[title];
    return titleCache[title];
  }
  
  // Case-insensitive exact match
  const lower = title.toLowerCase();
  for (const [key, val] of Object.entries(EXACT_TITLE_TRANSLATIONS)) {
    if (key.toLowerCase() === lower) {
      titleCache[title] = val;
      return val;
    }
  }
  
  // Word-by-word (longest first)
  let result = title;
  const sorted = Object.entries(WORD_DICT).sort((a, b) => b[0].length - a[0].length);
  for (const [en, bg] of sorted) {
    if (!bg) continue;
    const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'g');
    result = result.replace(regex, bg);
  }
  result = result.replace(/\s+/g, ' ').trim();
  
  titleCache[title] = result;
  return result;
}


// ============================================================
// COOKING STEPS TRANSLATION DICTIONARY
// ============================================================
const STEP_DICT: Record<string, string> = {
  // Cooking verbs
  'Melt': 'Разтопете', 'melt': 'разтопете', 'melted': 'разтопен',
  'Peel': 'Обелете', 'peel': 'обелете', 'peeled': 'обелен',
  'Cut': 'Нарежете', 'cut': 'нарежете',
  'Slice': 'Нарежете на филийки', 'slice': 'нарежете на филийки', 'sliced': 'нарязан',
  'Chop': 'Накълцайте', 'chop': 'накълцайте', 'chopped': 'накълцан',
  'Dice': 'Нарежете на кубчета', 'dice': 'нарежете на кубчета', 'diced': 'на кубчета',
  'Mince': 'Смелете', 'mince': 'смелете', 'minced': 'смлян',
  'Grate': 'Настържете', 'grate': 'настържете', 'grated': 'настърган',
  'Mix': 'Смесете', 'mix': 'смесете', 'mixed': 'смесен',
  'Stir': 'Разбъркайте', 'stir': 'разбъркайте', 'stirring': 'разбъркване',
  'Whisk': 'Разбийте с бъркалка', 'whisked': 'разбит',
  'Beat': 'Разбийте', 'beat': 'разбийте', 'beaten': 'разбит',
  'Pour': 'Излейте', 'pour': 'излейте',
  'Add': 'Добавете', 'add': 'добавете', 'added': 'добавен', 'adding': 'добавяне',
  'Put': 'Сложете', 'put': 'сложете',
  'Place': 'Поставете', 'place': 'поставете',
  'Cover': 'Покрийте', 'cover': 'покрийте', 'covered': 'покрит',
  'Remove': 'Махнете', 'remove': 'махнете',
  'Drain': 'Отцедете', 'drain': 'отцедете',
  'Season': 'Подправете', 'season': 'подправете',
  'Serve': 'Сервирайте', 'serve': 'сервирайте', 'serving': 'сервиране',
  'Sprinkle': 'Поръсете', 'sprinkle': 'поръсете',
  'Heat': 'Загрейте', 'heat': 'загрейте', 'heated': 'загрят',
  'Preheat': 'Загрейте предварително', 'preheat': 'загрейте предварително',
  'Boil': 'Сварете', 'boil': 'сварете', 'boiled': 'сварен', 'boiling': 'варене',
  'Simmer': 'Варете на тих огън', 'simmer': 'варете на тих огън', 'simmering': 'варене на тих огън',
  'Fry': 'Изпържете', 'fry': 'изпържете', 'fried': 'изпържен', 'frying': 'пържене',
  'Saute': 'Задушете', 'saute': 'задушете',
  'Roast': 'Изпечете', 'roast': 'изпечете', 'roasted': 'изпечен',
  'Bake': 'Изпечете', 'bake': 'изпечете', 'baked': 'изпечен', 'baking': 'печене',
  'Grill': 'Опечете на скара', 'grilled': 'опечен на скара',
  'Cook': 'Гответе', 'cook': 'гответе', 'cooked': 'сготвен', 'cooking': 'готвене',
  'Prepare': 'Подгответе', 'prepare': 'подгответе',
  'Make': 'Направете', 'make': 'направете',
  'Turn': 'Обърнете', 'turn': 'обърнете',
  'Flip': 'Обърнете', 'flip': 'обърнете',
  'Toss': 'Разбъркайте', 'toss': 'разбъркайте',
  'Combine': 'Комбинирайте', 'combine': 'комбинирайте',
  'Blend': 'Смесете в блендер', 'blend': 'смесете в блендер',
  'Reduce': 'Редуцирайте', 'reduce': 'редуцирайте',
  'Bring': 'Доведете', 'bring': 'доведете',
  'Let': 'Оставете', 'let': 'оставете',
  'Rest': 'Оставете да отпочине', 'rest': 'оставете да отпочине',
  'Transfer': 'Прехвърлете', 'transfer': 'прехвърлете',
  'Roll': 'Разточете', 'roll': 'разточете',
  'Shape': 'Оформете', 'shape': 'оформете',
  'Brush': 'Намажете', 'brush': 'намажете', 'brushing': 'намазване',
  'Wrap': 'Увийте', 'wrap': 'увийте',
  'Seal': 'Затворете', 'seal': 'затворете',
  'Break': 'Счупете', 'break': 'счупете',
  'Continue': 'Продължете', 'continue': 'продължете',
  'Finish': 'Завършете', 'finish': 'завършете',
  'Ensure': 'Уверете се', 'ensure': 'уверете се',
  
  // Equipment
  'pan': 'тиган', 'Pan': 'Тиган',
  'skillet': 'тиган', 'Skillet': 'Тиган',
  'pot': 'тенджера', 'Pot': 'Тенджера',
  'bowl': 'купа', 'Bowl': 'Купа',
  'oven': 'фурна', 'Oven': 'Фурна',
  'fridge': 'хладилник',
  
  // Measurements
  'tablespoon': 'супена лъжица', 'tablespoons': 'супени лъжици', 'tbsp': 'с.л.',
  'teaspoon': 'чаена лъжица', 'teaspoons': 'чаени лъжици', 'tsp': 'ч.л.',
  'cup': 'чаша', 'cups': 'чаши', 'Cups': 'Чаши',
  'pinch': 'щипка',
  'minute': 'минута', 'minutes': 'минути', 'mins': 'мин',
  'hour': 'час', 'hours': 'часа',
  'second': 'секунда', 'seconds': 'секунди',
  
  // Common words
  'When': 'Когато', 'when': 'когато',
  'While': 'Докато', 'while': 'докато',
  'Until': 'Докато', 'until': 'докато',
  'Then': 'След това', 'then': 'след това',
  'Next': 'След това', 'next': 'след това',
  'Finally': 'Накрая', 'finally': 'накрая',
  'First': 'Първо', 'first': 'първо',
  'or': 'или', 'and': 'и', 'with': 'с', 'into': 'в', 'in': 'в',
  'on': 'на', 'for': 'за', 'from': 'от', 'over': 'над', 'through': 'през',
  'the': '', 'a': '', 'an': '',
  'thick': 'гъст', 'thin': 'тънък', 'cold': 'студен', 'hot': 'горещ',
  'golden': 'златист', 'low': 'слаб', 'high': 'силен', 'medium': 'средно',
  'small': 'малък', 'large': 'голям',
  'quickly': 'бързо', 'slowly': 'бавно', 'lightly': 'леко',
  'little by little': 'малко по малко',
  'set aside': 'оставете настрана',
  'aside': 'настрана',
  
  // Ingredients in steps
  'butter': 'масло', 'flour': 'брашно', 'stock': 'бульон',
  'onion': 'лук', 'garlic': 'чесън', 'salt': 'сол', 'pepper': 'пипер',
  'oil': 'олио', 'water': 'вода', 'milk': 'мляко', 'cream': 'сметана',
  'sugar': 'захар', 'honey': 'мед', 'vinegar': 'оцет', 'sauce': 'сос',
  'chicken': 'пиле', 'beef': 'телешко', 'pork': 'свинско', 'lamb': 'агнешко',
  'meat': 'месо', 'egg': 'яйце', 'eggs': 'яйца', 'cheese': 'сирене',
  'rice': 'ориз', 'pasta': 'паста', 'bread': 'хляб',
  'tomato': 'домат', 'tomatoes': 'домати', 'potato': 'картоф', 'potatoes': 'картофи',
  'carrot': 'морков', 'carrots': 'моркови', 'celery': 'целина',
  'mushroom': 'гъба', 'mushrooms': 'гъби',
  'cabbage': 'зеле', 'ginger': 'джинджифил',
  'mixture': 'смес', 'liquid': 'течност', 'surface': 'повърхност',
};

// Translate cooking steps text
function translateStepText(text: string): string {
  let result = text;
  const sorted = Object.entries(STEP_DICT).sort((a, b) => b[0].length - a[0].length);
  for (const [en, bg] of sorted) {
    if (bg === '') {
      const regex = new RegExp(`\\b${en}\\b\\s*`, 'g');
      result = result.replace(regex, '');
    } else {
      const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'g');
      result = result.replace(regex, bg);
    }
  }
  return result.replace(/\s+/g, ' ').trim();
}


// ============================================================
// INGREDIENT TRANSLATION
// ============================================================
const INGREDIENT_TRANSLATIONS: Record<string, string> = {
  'Olive Oil': 'зехтин', 'olive oil': 'зехтин',
  'Vegetable Oil': 'растително олио', 'vegetable oil': 'растително олио',
  'Sunflower Oil': 'слънчогледово олио', 'Oil': 'Олио', 'oil': 'олио',
  'Ground Pork': 'свинска кайма', 'ground pork': 'свинска кайма',
  'Ground Beef': 'телешка кайма', 'ground beef': 'телешка кайма',
  'Ground Chicken': 'пилешка кайма', 'ground chicken': 'пилешка кайма',
  'Garlic': 'чесън', 'garlic': 'чесън',
  'Ginger': 'джинджифил', 'ginger': 'джинджифил',
  'Carrots': 'моркови', 'carrots': 'моркови', 'Carrot': 'морков',
  'Scallions': 'зелен лук', 'scallions': 'зелен лук', 'Scallion': 'зелен лук',
  'Cabbage': 'зеле', 'cabbage': 'зеле',
  'Soy Sauce': 'соев сос', 'soy sauce': 'соев сос',
  'Rice Vinegar': 'оризов оцет', 'rice vinegar': 'оризов оцет',
  'Egg Roll Wrappers': 'кори за спринг ролс', 'egg roll wrappers': 'кори за спринг ролс',
  'Duck Sauce': 'сладък сос', 'duck sauce': 'сладък сос',
  'Sesame Oil': 'сусамово олио', 'sesame oil': 'сусамово олио',
  'Cornstarch': 'нишесте', 'cornstarch': 'нишесте',
  'Flour': 'брашно', 'flour': 'брашно',
  'Sugar': 'захар', 'sugar': 'захар',
  'Salt': 'сол', 'salt': 'сол',
  'Pepper': 'пипер', 'pepper': 'пипер',
  'Black Pepper': 'черен пипер', 'black pepper': 'черен пипер',
  'Butter': 'масло', 'butter': 'масло',
  'Milk': 'мляко', 'milk': 'мляко',
  'Cream': 'сметана', 'cream': 'сметана',
  'Heavy Cream': 'гъста сметана', 'heavy cream': 'гъста сметана',
  'Eggs': 'яйца', 'eggs': 'яйца', 'Egg': 'яйце', 'egg': 'яйце',
  'Egg Yolks': 'жълтъци', 'Egg Whites': 'белтъци',
  'Onion': 'лук', 'onion': 'лук', 'Onions': 'лук',
  'Tomato': 'домат', 'Tomatoes': 'домати', 'tomatoes': 'домати',
  'Potato': 'картоф', 'Potatoes': 'картофи', 'potatoes': 'картофи',
  'Chicken': 'пиле', 'chicken': 'пиле',
  'Chicken Breast': 'пилешко филе', 'chicken breast': 'пилешко филе',
  'Beef': 'телешко', 'beef': 'телешко',
  'Pork': 'свинско', 'pork': 'свинско',
  'Lamb': 'агнешко', 'lamb': 'агнешко',
  'Salmon': 'сьомга', 'salmon': 'сьомга',
  'Rice': 'ориз', 'rice': 'ориз',
  'Pasta': 'паста', 'pasta': 'паста',
  'Spaghetti': 'спагети', 'Noodles': 'нудли',
  'Cheese': 'сирене', 'cheese': 'сирене',
  'Parmesan': 'пармезан', 'parmesan': 'пармезан',
  'Mozzarella': 'моцарела', 'mozzarella': 'моцарела',
  'Honey': 'мед', 'honey': 'мед',
  'Lemon': 'лимон', 'lemon': 'лимон',
  'Lemon Juice': 'лимонов сок', 'lemon juice': 'лимонов сок',
  'Vanilla Extract': 'ванилов екстракт', 'vanilla extract': 'ванилов екстракт',
  'Baking Powder': 'бакпулвер', 'baking powder': 'бакпулвер',
  'Baking Soda': 'сода бикарбонат',
  'Cinnamon': 'канела', 'cinnamon': 'канела',
  'Nutmeg': 'индийско орехче', 'nutmeg': 'индийско орехче',
  'Cocoa': 'какао', 'cocoa': 'какао',
  'Chocolate': 'шоколад', 'chocolate': 'шоколад',
  'Dark Chocolate': 'тъмен шоколад',
  'Water': 'вода', 'water': 'вода',
  'Wine': 'вино', 'wine': 'вино',
  'Vinegar': 'оцет', 'vinegar': 'оцет',
  'Mustard': 'горчица', 'mustard': 'горчица',
  'Breadcrumbs': 'галета', 'breadcrumbs': 'галета',
  'Spinach': 'спанак', 'spinach': 'спанак',
  'Mushrooms': 'гъби', 'mushrooms': 'гъби',
  'Broccoli': 'броколи', 'broccoli': 'броколи',
  'Bacon': 'бекон', 'bacon': 'бекон',
  'Ham': 'шунка', 'ham': 'шунка',
  'Almonds': 'бадеми', 'almonds': 'бадеми',
  'Walnuts': 'орехи', 'walnuts': 'орехи',
  'Coconut Milk': 'кокосово мляко', 'coconut milk': 'кокосово мляко',
  'Tomato Paste': 'доматено пюре', 'tomato paste': 'доматено пюре',
  'Tomato Sauce': 'доматен сос', 'tomato sauce': 'доматен сос',
  'Chicken Stock': 'пилешки бульон', 'chicken stock': 'пилешки бульон',
  'Beef Stock': 'телешки бульон', 'beef stock': 'телешки бульон',
  'Fish Sauce': 'рибен сос', 'fish sauce': 'рибен сос',
  'Worcestershire Sauce': 'Уорчестърски сос',
  'Chili Flakes': 'люти люспи', 'chili flakes': 'люти люспи',
  'Cumin': 'кимион', 'cumin': 'кимион',
  'Paprika': 'червен пипер', 'paprika': 'червен пипер',
  'Turmeric': 'куркума', 'turmeric': 'куркума',
  'Oregano': 'риган', 'oregano': 'риган',
  'Basil': 'босилек', 'basil': 'босилек',
  'Parsley': 'магданоз', 'parsley': 'магданоз',
  'Cilantro': 'кориандър', 'cilantro': 'кориандър',
  'Rosemary': 'розмарин', 'rosemary': 'розмарин',
  'Thyme': 'мащерка', 'thyme': 'мащерка',
  'Bay Leaf': 'дафинов лист', 'bay leaf': 'дафинов лист',
  'Bay Leaves': 'дафинови листа',
};

const UNIT_TRANSLATIONS: Record<string, string> = {
  'g': 'г', 'kg': 'кг', 'ml': 'мл', 'l': 'л', 'oz': 'унции', 'lb': 'паунда',
  'tsp': 'ч.л.', 'teaspoon': 'ч.л.', 'teaspoons': 'ч.л.',
  'tbsp': 'с.л.', 'tbs': 'с.л.', 'tablespoon': 'с.л.', 'tablespoons': 'с.л.',
  'cup': 'чаша', 'cups': 'чаши', 'Cups': 'Чаши',
  'piece': 'бр.', 'pieces': 'бр.', 'pcs': 'бр.',
  'pinch': 'щипка', 'bunch': 'връзка',
  'clove': 'скилидка', 'cloves': 'скилидки',
  'slice': 'резен', 'slices': 'резена',
  'large': 'големи', 'medium': 'средни', 'small': 'малки',
  'whole': 'цял', 'half': 'половин',
  'to taste': 'по вкус', 'taste': 'по вкус',
  'can': 'консерва', 'cans': 'консерви',
  'head': 'глава',
  'stalk': 'стрък', 'stalks': 'стръка',
  'handful': 'шепа', 'dash': 'капка',
  'chopped': 'накълцан', 'crushed': 'смачкан', 'peeled': 'обелен',
  'For brushing': 'За намазване', 'for brushing': 'за намазване',
  'To serve': 'За сервиране', 'to serve': 'за сервиране',
};

function translateUnit(unit: string): string {
  if (!unit) return '';
  let clean = unit.replace(/^[\s\/]+/, '').replace(/[\s\/]+$/, '').trim();
  const lower = clean.toLowerCase();
  return UNIT_TRANSLATIONS[lower] || UNIT_TRANSLATIONS[clean] || clean;
}

function translateIngredientName(name: string): string {
  if (!name) return name;
  
  // Check exact match (longest first)
  const sorted = Object.entries(INGREDIENT_TRANSLATIONS).sort((a, b) => b[0].length - a[0].length);
  let result = name;
  for (const [en, bg] of sorted) {
    const regex = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, bg);
  }
  return result;
}


// ============================================================
// FILTER STEPS
// ============================================================
const filterSteps = (steps: string[]): string[] => {
  return steps.filter(step => {
    const trimmed = step.trim().toLowerCase();
    if (/^step\s*\d+\.?$/i.test(trimmed)) return false;
    if (trimmed.length < 10) return false;
    return true;
  });
};


// ============================================================
// MAIN COMPONENT
// ============================================================
interface Recipe {
  _id: string;
  title: string;
  description?: string;
  mainImage?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  ingredients: Array<{ name: string; amount: number; unit: string }>;
  steps: string[];
  tags?: string[];
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  author?: { username?: string };
  isFromAPI?: boolean;
}

export default function APIRecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { language } = useThemeStore();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [servings, setServings] = useState(1);
  const [translating, setTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<{
    title: string;
    steps: string[];
    ingredients: string[];
  } | null>(null);

  const isBg = language === 'bg';

  const t = {
    loading: isBg ? 'Зареждане на рецептата...' : 'Loading recipe...',
    translating: isBg ? 'Превеждане...' : 'Translating...',
    notFound: isBg ? 'Рецептата не е намерена' : 'Recipe not found',
    backToRecipes: isBg ? 'Към рецептите' : 'Back to recipes',
    ingredients: isBg ? 'Съставки' : 'Ingredients',
    servingsLabel: isBg ? (servings === 1 ? 'порция' : 'порции') : (servings === 1 ? 'serving' : 'servings'),
    steps: isBg ? 'Стъпки' : 'Steps',
    step: isBg ? 'Стъпка' : 'Step',
    nutrition: isBg ? 'Хранителна стойност' : 'Nutrition',
    calories: isBg ? 'Калории' : 'Calories',
    protein: isBg ? 'Протеин' : 'Protein',
    carbs: isBg ? 'Въглехидрати' : 'Carbs',
    fat: isBg ? 'Мазнини' : 'Fat',
    addedFav: isBg ? 'Добавено в любими!' : 'Added to favorites!',
    removedFav: isBg ? 'Премахнато от любими' : 'Removed from favorites',
    loginFirst: isBg ? 'Влез в профила си' : 'Please login first',
    errorFav: isBg ? 'Грешка при добавяне' : 'Error adding to favorites',
    min: isBg ? 'мин' : 'min',
    tryAgain: isBg ? 'Опитай отново' : 'Try Again',
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      setLoading(true);
      setTranslatedContent(null);
      
      try {
        let data = await mealdbApi.getById(id);
        
        if (!data && (id.startsWith('fallback_') || !id.includes('mealdb_'))) {
          const searchResults = await mealdbApi.searchByName(id.replace('fallback_', '').replace(/_/g, ' '));
          if (searchResults.length > 0) data = searchResults[0];
        }
        
        if (!data && id.includes('mealdb_')) {
          await new Promise(resolve => setTimeout(resolve, 500));
          data = await mealdbApi.getById(id);
        }
        
        if (data) {
          const filteredSteps = filterSteps(data.steps || []);
          const recipeWithFilteredSteps = { ...data, steps: filteredSteps };
          setRecipe(recipeWithFilteredSteps);
          setServings(1);
          
          // Translate if Bulgarian
          if (isBg && filteredSteps.length > 0) {
            const cacheKey = `${id}-bg`;
            
            if (translationCache[cacheKey]) {
              setTranslatedContent(translationCache[cacheKey]);
            } else {
              setTranslating(true);
              
              const ingredientStrings = data.ingredients.map((ing: any) => 
                `${ing.amount} ${ing.unit} ${ing.name}`
              );
              
              let translation;
              
              try {
                // Try backend API first
                translation = await recipeApi.translateRecipe(
                  data.title,
                  filteredSteps,
                  ingredientStrings
                );
              } catch (apiError) {
                // Fallback to comprehensive local translation
                translation = {
                  title: translateTitle(data.title),
                  steps: filteredSteps.map((step: string) => translateStepText(step)),
                  ingredients: ingredientStrings.map((ing: string) => translateStepText(ing)),
                };
              }
              
              translationCache[cacheKey] = translation;
              setTranslatedContent(translation);
              setTranslating(false);
            }
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, language, isBg]);

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error(t.loginFirst);
      return;
    }
    if (!recipe) return;

    setSavingFavorite(true);
    try {
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
        description = `${recipe.title} - вкусна рецепта от TheMealDB. Опитайте тази невероятна рецепта!`;
      }

      let steps = recipe.steps || [];
      steps = steps.filter(s => s && s.trim()).map(s => s.trim());
      if (steps.length === 0) {
        steps = ['Следвайте инструкциите за приготвяне на тази вкусна рецепта.'];
      }

      const mainImage = recipe.mainImage && recipe.mainImage.startsWith('http') 
        ? recipe.mainImage 
        : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

      const recipeData = {
        title: recipe.title || 'Рецепта',
        description,
        mainImage,
        prepTime: recipe.prepTime || 15,
        cookTime: recipe.cookTime || 30,
        servings: recipe.servings || 1, // *** FIX: was 4, now 1 ***
        ingredients: formattedIngredients,
        steps,
        tags: [],
        nutrition: {
          calories: recipe.nutrition?.calories || 300,
          protein: recipe.nutrition?.protein || 20,
          carbs: recipe.nutrition?.carbs || 30,
          fat: recipe.nutrition?.fat || 15,
        },
      };

      const savedRecipe = await recipeApi.createRecipe(recipeData);
      const result = await favoriteApi.toggleFavorite(savedRecipe.recipe._id);
      setIsFavorited(result.isFavorited);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(result.isFavorited ? t.addedFav : t.removedFav);
    } catch (error: any) {
      console.error('Favorite error:', error);
      toast.error(error.response?.data?.message || t.errorFav);
    } finally {
      setSavingFavorite(false);
    }
  };

  const scaleAmount = (amount: number) => {
    const baseServings = recipe?.servings || 1;
    return Math.round((amount / baseServings) * servings * 100) / 100;
  };

  // Loading
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-forest-600 mx-auto mb-4" />
        <p className="text-wood-600 dark:text-cream-400">{t.loading}</p>
      </div>
    );
  }

  // Error
  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-xl text-wood-600 dark:text-cream-400 mb-4">{t.notFound}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 font-medium"
          >
            {t.tryAgain}
          </button>
          <button
            onClick={() => navigate('/recipes')}
            className="text-forest-600 hover:text-forest-700 font-medium"
          >
            {t.backToRecipes}
          </button>
        </div>
      </div>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  
  // Use translated title if available, otherwise use local translation
  const displayTitle = isBg 
    ? (translatedContent?.title || translateTitle(recipe.title))
    : recipe.title;
  const displaySteps = isBg
    ? (translatedContent?.steps || recipe.steps.map(s => translateStepText(s)))
    : recipe.steps;

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px]">
        <img
          src={recipe.mainImage || '/placeholder-food.jpg'}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-cream-100/90 dark:bg-wood-800/90 text-wood-800 dark:text-cream-100 hover:bg-cream-200 dark:hover:bg-wood-700 transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleFavorite}
            disabled={savingFavorite}
            className={cn(
              'p-3 rounded-full shadow-lg transition-all',
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-cream-100/90 dark:bg-wood-800/90 text-wood-600 hover:bg-red-500 hover:text-white'
            )}
          >
            {savingFavorite ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Heart className={cn('w-5 h-5', isFavorited && 'fill-current')} />
            )}
          </button>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-full text-sm font-medium shadow-lg">
            <Globe className="w-4 h-4" />
            TheMealDB
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-cream-100 mb-3">
            {displayTitle}
            {translating && <span className="text-sm font-normal ml-2">({t.translating})</span>}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-cream-200">
            {totalTime > 0 && (
              <span className="flex items-center gap-1.5 bg-wood-900/50 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                {totalTime} {t.min}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1.5 bg-wood-900/50 px-3 py-1 rounded-full">
                <Users className="w-4 h-4" />
                {recipe.servings} {t.servingsLabel}
              </span>
            )}
            {recipe.nutrition?.calories && (
              <span className="flex items-center gap-1.5 bg-wood-900/50 px-3 py-1 rounded-full">
                <Flame className="w-4 h-4" />
                {recipe.nutrition.calories} kcal
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-cream-100 dark:bg-wood-800 rounded-2xl p-6 border-2 border-wood-200 dark:border-wood-600 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-wood-800 dark:text-cream-100 mb-4">
                {t.ingredients}
              </h2>
              
              <div className="flex items-center gap-3 mb-6 p-3 bg-wood-200 dark:bg-wood-700 rounded-xl">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-8 h-8 rounded-full bg-cream-100 dark:bg-wood-600 text-wood-800 dark:text-cream-100 font-bold hover:bg-forest-500 hover:text-white transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center font-medium text-wood-800 dark:text-cream-100">
                  {servings} {t.servingsLabel}
                </span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="w-8 h-8 rounded-full bg-cream-100 dark:bg-wood-600 text-wood-800 dark:text-cream-100 font-bold hover:bg-forest-500 hover:text-white transition-colors"
                >
                  +
                </button>
              </div>

              <ul className="space-y-3">
                {recipe.ingredients?.map((ing, idx) => {
                  const scaledAmount = scaleAmount(ing.amount || 1);
                  const formatAmount = (amt: number) => {
                    if (amt === Math.floor(amt)) return amt.toString();
                    return amt.toFixed(1).replace(/\.0$/, '');
                  };
                  
                  const unit = isBg ? translateUnit(ing.unit || '') : (ing.unit || '');
                  const name = isBg ? translateIngredientName(ing.name) : ing.name;
                  
                  return (
                    <li key={idx} className="flex items-start gap-3 text-wood-700 dark:text-cream-300">
                      <span className="w-2 h-2 rounded-full bg-forest-500 mt-2 flex-shrink-0" />
                      <span>
                        <strong>{formatAmount(scaledAmount)} {unit}</strong> {name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Steps */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-serif font-bold text-wood-800 dark:text-cream-100 mb-6">
              {t.steps}
              {translating && <span className="text-sm font-normal text-wood-500 dark:text-cream-400 ml-2">({t.translating})</span>}
            </h2>
            
            <div className="space-y-6">
              {displaySteps?.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => toggleStep(idx)}
                  className={cn(
                    'rounded-xl cursor-pointer transition-all border-2 overflow-hidden',
                    completedSteps.includes(idx)
                      ? 'bg-forest-50 dark:bg-forest-900/20 border-forest-300 dark:border-forest-700'
                      : 'bg-cream-100 dark:bg-wood-800 border-wood-200 dark:border-wood-600 hover:border-forest-300'
                  )}
                >
                  <div className={cn(
                    'px-4 py-2 flex items-center gap-3',
                    completedSteps.includes(idx)
                      ? 'bg-forest-500 text-white'
                      : 'bg-wood-200 dark:bg-wood-700 text-wood-800 dark:text-cream-100'
                  )}>
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm',
                      completedSteps.includes(idx)
                        ? 'bg-white/20'
                        : 'bg-cream-100 dark:bg-wood-600'
                    )}>
                      {completedSteps.includes(idx) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className="font-semibold">
                      {t.step} {idx + 1}
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <p className={cn(
                      'text-wood-700 dark:text-cream-300 leading-relaxed',
                      completedSteps.includes(idx) && 'line-through opacity-60'
                    )}>
                      {step}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Nutrition */}
            {recipe.nutrition && (
              <div className="mt-8 bg-cream-100 dark:bg-wood-800 rounded-2xl p-6 border-2 border-wood-200 dark:border-wood-600">
                <h2 className="text-xl font-serif font-bold text-wood-800 dark:text-cream-100 mb-4">
                  {t.nutrition}
                </h2>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-forest-600">{recipe.nutrition.calories || 0}</div>
                    <div className="text-sm text-wood-500 dark:text-cream-400">{t.calories}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{recipe.nutrition.protein || 0}g</div>
                    <div className="text-sm text-wood-500 dark:text-cream-400">{t.protein}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">{recipe.nutrition.carbs || 0}g</div>
                    <div className="text-sm text-wood-500 dark:text-cream-400">{t.carbs}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{recipe.nutrition.fat || 0}g</div>
                    <div className="text-sm text-wood-500 dark:text-cream-400">{t.fat}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
