import { NextResponse } from "next/server";

// Comprehensive food database with nutritional info per 100g or standard serving
const foodDatabase = [
  // Fruits
  { name: "Apple", serving: "1 medium (182g)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
  { name: "Banana", serving: "1 medium (118g)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1 },
  { name: "Orange", serving: "1 medium (131g)", calories: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3.1 },
  { name: "Grapes", serving: "1 cup (151g)", calories: 104, protein: 1.1, carbs: 27, fat: 0.2, fiber: 1.4 },
  { name: "Strawberries", serving: "1 cup (144g)", calories: 46, protein: 1, carbs: 11, fat: 0.4, fiber: 2.9 },
  { name: "Mango", serving: "1 cup (165g)", calories: 99, protein: 1.4, carbs: 25, fat: 0.6, fiber: 2.6 },
  { name: "Pineapple", serving: "1 cup (165g)", calories: 82, protein: 0.9, carbs: 22, fat: 0.2, fiber: 2.3 },
  { name: "Watermelon", serving: "1 cup (152g)", calories: 46, protein: 0.9, carbs: 12, fat: 0.2, fiber: 0.6 },
  { name: "Avocado", serving: "1/2 fruit (100g)", calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
  
  // Vegetables
  { name: "Broccoli", serving: "1 cup (91g)", calories: 31, protein: 2.5, carbs: 6, fat: 0.3, fiber: 2.4 },
  { name: "Spinach", serving: "1 cup raw (30g)", calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7 },
  { name: "Carrot", serving: "1 medium (61g)", calories: 25, protein: 0.6, carbs: 6, fat: 0.1, fiber: 1.7 },
  { name: "Tomato", serving: "1 medium (123g)", calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, fiber: 1.5 },
  { name: "Cucumber", serving: "1 cup (104g)", calories: 16, protein: 0.7, carbs: 3.8, fat: 0.1, fiber: 0.5 },
  { name: "Bell Pepper", serving: "1 medium (119g)", calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  { name: "Onion", serving: "1 medium (110g)", calories: 44, protein: 1.2, carbs: 10, fat: 0.1, fiber: 1.9 },
  { name: "Potato", serving: "1 medium (150g)", calories: 161, protein: 4.3, carbs: 37, fat: 0.2, fiber: 3.8 },
  { name: "Sweet Potato", serving: "1 medium (130g)", calories: 112, protein: 2.1, carbs: 26, fat: 0.1, fiber: 3.9 },
  
  // Proteins - Meat
  { name: "Chicken Breast", serving: "100g cooked", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { name: "Chicken Thigh", serving: "100g cooked", calories: 209, protein: 26, carbs: 0, fat: 11, fiber: 0 },
  { name: "Ground Beef (80/20)", serving: "100g cooked", calories: 254, protein: 26, carbs: 0, fat: 17, fiber: 0 },
  { name: "Ground Beef (90/10)", serving: "100g cooked", calories: 176, protein: 26, carbs: 0, fat: 8, fiber: 0 },
  { name: "Steak (Sirloin)", serving: "100g cooked", calories: 206, protein: 26, carbs: 0, fat: 11, fiber: 0 },
  { name: "Pork Chop", serving: "100g cooked", calories: 231, protein: 25, carbs: 0, fat: 14, fiber: 0 },
  { name: "Bacon", serving: "3 slices (35g)", calories: 161, protein: 12, carbs: 0.4, fat: 12, fiber: 0 },
  { name: "Turkey Breast", serving: "100g cooked", calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0 },
  { name: "Lamb", serving: "100g cooked", calories: 250, protein: 26, carbs: 0, fat: 16, fiber: 0 },
  
  // Proteins - Seafood
  { name: "Salmon", serving: "100g cooked", calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  { name: "Tuna", serving: "100g canned", calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0 },
  { name: "Shrimp", serving: "100g cooked", calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 },
  { name: "Tilapia", serving: "100g cooked", calories: 128, protein: 26, carbs: 0, fat: 2.7, fiber: 0 },
  { name: "Cod", serving: "100g cooked", calories: 105, protein: 23, carbs: 0, fat: 0.9, fiber: 0 },
  { name: "Sardines", serving: "100g canned", calories: 208, protein: 25, carbs: 0, fat: 11, fiber: 0 },
  
  // Proteins - Other
  { name: "Egg", serving: "1 large (50g)", calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0 },
  { name: "Egg White", serving: "1 large (33g)", calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, fiber: 0 },
  { name: "Tofu", serving: "100g", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  { name: "Tempeh", serving: "100g", calories: 192, protein: 20, carbs: 8, fat: 11, fiber: 0 },
  
  // Dairy
  { name: "Milk (Whole)", serving: "1 cup (244ml)", calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0 },
  { name: "Milk (2%)", serving: "1 cup (244ml)", calories: 122, protein: 8, carbs: 12, fat: 5, fiber: 0 },
  { name: "Milk (Skim)", serving: "1 cup (244ml)", calories: 83, protein: 8, carbs: 12, fat: 0.2, fiber: 0 },
  { name: "Greek Yogurt", serving: "1 cup (245g)", calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0 },
  { name: "Regular Yogurt", serving: "1 cup (245g)", calories: 149, protein: 9, carbs: 17, fat: 5, fiber: 0 },
  { name: "Cheddar Cheese", serving: "1 oz (28g)", calories: 113, protein: 7, carbs: 0.4, fat: 9, fiber: 0 },
  { name: "Mozzarella Cheese", serving: "1 oz (28g)", calories: 85, protein: 6, carbs: 0.6, fat: 6, fiber: 0 },
  { name: "Cottage Cheese", serving: "1 cup (226g)", calories: 206, protein: 28, carbs: 6, fat: 9, fiber: 0 },
  { name: "Butter", serving: "1 tbsp (14g)", calories: 102, protein: 0.1, carbs: 0, fat: 12, fiber: 0 },
  
  // Grains & Carbs
  { name: "White Rice", serving: "1 cup cooked (158g)", calories: 206, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6 },
  { name: "Brown Rice", serving: "1 cup cooked (195g)", calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5 },
  { name: "Pasta", serving: "1 cup cooked (140g)", calories: 221, protein: 8, carbs: 43, fat: 1.3, fiber: 2.5 },
  { name: "Bread (White)", serving: "1 slice (25g)", calories: 67, protein: 2, carbs: 13, fat: 0.8, fiber: 0.6 },
  { name: "Bread (Whole Wheat)", serving: "1 slice (28g)", calories: 69, protein: 3.6, carbs: 12, fat: 1.1, fiber: 1.9 },
  { name: "Oatmeal", serving: "1 cup cooked (234g)", calories: 158, protein: 6, carbs: 27, fat: 3.2, fiber: 4 },
  { name: "Quinoa", serving: "1 cup cooked (185g)", calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5 },
  { name: "Tortilla (Flour)", serving: "1 medium (45g)", calories: 140, protein: 3.5, carbs: 24, fat: 3.5, fiber: 1.5 },
  { name: "Tortilla (Corn)", serving: "1 medium (26g)", calories: 52, protein: 1.4, carbs: 11, fat: 0.7, fiber: 1.5 },
  { name: "Bagel", serving: "1 medium (98g)", calories: 277, protein: 11, carbs: 54, fat: 1.4, fiber: 2.4 },
  
  // Legumes & Nuts
  { name: "Black Beans", serving: "1 cup cooked (172g)", calories: 227, protein: 15, carbs: 41, fat: 0.9, fiber: 15 },
  { name: "Chickpeas", serving: "1 cup cooked (164g)", calories: 269, protein: 15, carbs: 45, fat: 4.2, fiber: 12.5 },
  { name: "Lentils", serving: "1 cup cooked (198g)", calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 16 },
  { name: "Peanut Butter", serving: "2 tbsp (32g)", calories: 188, protein: 8, carbs: 6, fat: 16, fiber: 1.9 },
  { name: "Almonds", serving: "1 oz (28g)", calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5 },
  { name: "Walnuts", serving: "1 oz (28g)", calories: 185, protein: 4.3, carbs: 4, fat: 18, fiber: 1.9 },
  { name: "Cashews", serving: "1 oz (28g)", calories: 157, protein: 5, carbs: 9, fat: 12, fiber: 0.9 },
  
  // Beverages
  { name: "Orange Juice", serving: "1 cup (248ml)", calories: 112, protein: 1.7, carbs: 26, fat: 0.5, fiber: 0.5 },
  { name: "Apple Juice", serving: "1 cup (248ml)", calories: 114, protein: 0.2, carbs: 28, fat: 0.3, fiber: 0.5 },
  { name: "Coffee (Black)", serving: "1 cup (240ml)", calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
  { name: "Tea (Unsweetened)", serving: "1 cup (240ml)", calories: 2, protein: 0, carbs: 0.5, fat: 0, fiber: 0 },
  { name: "Soda (Cola)", serving: "1 can (355ml)", calories: 140, protein: 0, carbs: 39, fat: 0, fiber: 0 },
  { name: "Beer", serving: "1 can (355ml)", calories: 153, protein: 1.6, carbs: 13, fat: 0, fiber: 0 },
  { name: "Red Wine", serving: "5 oz (148ml)", calories: 125, protein: 0.1, carbs: 4, fat: 0, fiber: 0 },
  
  // Fast Food & Common Meals
  { name: "Pizza (Cheese)", serving: "1 slice (107g)", calories: 272, protein: 12, carbs: 34, fat: 10, fiber: 2.3 },
  { name: "Hamburger", serving: "1 regular (110g)", calories: 295, protein: 17, carbs: 24, fat: 14, fiber: 1.3 },
  { name: "French Fries", serving: "medium (117g)", calories: 365, protein: 4, carbs: 48, fat: 17, fiber: 4 },
  { name: "Hot Dog", serving: "1 with bun (98g)", calories: 290, protein: 11, carbs: 24, fat: 17, fiber: 1.2 },
  { name: "Fried Chicken", serving: "1 piece (113g)", calories: 320, protein: 22, carbs: 11, fat: 21, fiber: 0.4 },
  { name: "Burrito", serving: "1 large (272g)", calories: 431, protein: 21, carbs: 50, fat: 17, fiber: 6 },
  { name: "Tacos", serving: "1 taco (85g)", calories: 156, protein: 8, carbs: 14, fat: 7, fiber: 1.5 },
  { name: "Sushi Roll", serving: "6 pieces (158g)", calories: 200, protein: 9, carbs: 38, fat: 0.7, fiber: 1.5 },
  { name: "Caesar Salad", serving: "1 bowl (267g)", calories: 190, protein: 8, carbs: 8, fat: 15, fiber: 2 },
  { name: "Grilled Cheese Sandwich", serving: "1 sandwich (117g)", calories: 390, protein: 16, carbs: 28, fat: 24, fiber: 1.5 },
  
  // Snacks & Sweets
  { name: "Potato Chips", serving: "1 oz (28g)", calories: 152, protein: 2, carbs: 15, fat: 10, fiber: 1.2 },
  { name: "Popcorn (Air-popped)", serving: "3 cups (24g)", calories: 93, protein: 3, carbs: 19, fat: 1.1, fiber: 3.6 },
  { name: "Chocolate Bar", serving: "1 bar (44g)", calories: 235, protein: 3, carbs: 26, fat: 13, fiber: 1.5 },
  { name: "Ice Cream", serving: "1/2 cup (66g)", calories: 137, protein: 2.3, carbs: 16, fat: 7, fiber: 0.5 },
  { name: "Cookie (Chocolate Chip)", serving: "1 medium (16g)", calories: 78, protein: 0.9, carbs: 9, fat: 4.5, fiber: 0.3 },
  { name: "Donut", serving: "1 medium (60g)", calories: 269, protein: 4, carbs: 31, fat: 15, fiber: 0.8 },
  { name: "Granola Bar", serving: "1 bar (28g)", calories: 117, protein: 2.5, carbs: 19, fat: 4, fiber: 1.5 },
  { name: "Trail Mix", serving: "1/4 cup (38g)", calories: 173, protein: 5, carbs: 17, fat: 11, fiber: 2 },
  
  // Breakfast Items
  { name: "Pancakes", serving: "2 medium (152g)", calories: 312, protein: 8, carbs: 52, fat: 8, fiber: 1.5 },
  { name: "Waffle", serving: "1 round (75g)", calories: 218, protein: 6, carbs: 25, fat: 11, fiber: 1.7 },
  { name: "Cereal (Corn Flakes)", serving: "1 cup (28g)", calories: 100, protein: 2, carbs: 24, fat: 0.1, fiber: 0.7 },
  { name: "Cereal (Granola)", serving: "1/2 cup (61g)", calories: 299, protein: 9, carbs: 32, fat: 15, fiber: 5 },
  { name: "Croissant", serving: "1 medium (57g)", calories: 231, protein: 5, carbs: 26, fat: 12, fiber: 1.5 },
  { name: "Muffin (Blueberry)", serving: "1 medium (113g)", calories: 377, protein: 6, carbs: 53, fat: 16, fiber: 2 },
  
  // Condiments & Extras
  { name: "Ketchup", serving: "1 tbsp (17g)", calories: 19, protein: 0.2, carbs: 5, fat: 0, fiber: 0 },
  { name: "Mayonnaise", serving: "1 tbsp (13g)", calories: 94, protein: 0.1, carbs: 0.1, fat: 10, fiber: 0 },
  { name: "Mustard", serving: "1 tsp (5g)", calories: 3, protein: 0.2, carbs: 0.3, fat: 0.2, fiber: 0.2 },
  { name: "Olive Oil", serving: "1 tbsp (14ml)", calories: 119, protein: 0, carbs: 0, fat: 14, fiber: 0 },
  { name: "Honey", serving: "1 tbsp (21g)", calories: 64, protein: 0.1, carbs: 17, fat: 0, fiber: 0 },
  { name: "Maple Syrup", serving: "1 tbsp (20g)", calories: 52, protein: 0, carbs: 13, fat: 0, fiber: 0 },
  { name: "Soy Sauce", serving: "1 tbsp (16ml)", calories: 9, protein: 1.3, carbs: 0.8, fat: 0, fiber: 0 },
  { name: "Salsa", serving: "2 tbsp (32g)", calories: 10, protein: 0.5, carbs: 2, fat: 0, fiber: 0.6 },
  { name: "Guacamole", serving: "2 tbsp (30g)", calories: 50, protein: 0.6, carbs: 3, fat: 4.5, fiber: 2 },
  { name: "Hummus", serving: "2 tbsp (28g)", calories: 50, protein: 2, carbs: 4, fat: 3, fiber: 1 },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ foods: [] });
  }

  const results = foodDatabase
    .filter((food) => food.name.toLowerCase().includes(query))
    .slice(0, 10);

  return NextResponse.json({ foods: results });
}
