import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const foods = [
    ['Canjeero', 'Canjeero', 'Somali', '1 piece', 80, 180, 5, 35, 2, 1], ['Bariis', 'Bariis', 'Somali', '1 cup cooked', 158, 205, 4, 45, .4, .6], ['Suqaar', 'Suqaar', 'Somali', '100 g', 100, 240, 26, 4, 14, 0], ['Muufo', 'Muufo', 'Somali', '1 piece', 100, 220, 6, 42, 3, 2], ['Caano geel', 'Caano geel', 'Somali', '1 cup', 245, 107, 5, 12, 5, 0], ['Muus', 'Muus', 'Somali', '1 medium', 118, 105, 1.3, 27, .4, 3.1],
    ['Oats', null, 'Grains', '40 g', 40, 152, 5.3, 27, 2.8, 4], ['Eggs', null, 'Protein', '1 large', 50, 72, 6.3, .4, 4.8, 0], ['Chicken breast', null, 'Protein', '100 g cooked', 100, 165, 31, 0, 3.6, 0], ['Rice', null, 'Grains', '1 cup cooked', 158, 205, 4.3, 44.5, .4, .6], ['Beans', null, 'Legumes', '1 cup cooked', 171, 239, 15, 43, .9, 15]
  ] as const;
  for (const [name, nameSo, category, servingLabel, servingGrams, calories, proteinG, carbsG, fatG, fiberG] of foods) await prisma.food.upsert({ where:{name}, update:{}, create:{name,nameSo,category,servingLabel,servingGrams,calories,proteinG,carbsG,fatG,fiberG,source:'USDA / curated local data',verifiedAt:new Date()} });
  const exercises = [
    ['Bodyweight Squat','A lower-body squat using body weight.',['quadriceps','glutes'],['none'],'Beginner',['Stand tall with feet shoulder-width apart.','Lower hips while keeping chest raised.','Drive through feet to stand.'],'Keep knees aligned with toes.',['Goblet Squat']],
    ['Push-up','A horizontal pressing movement.',['chest','triceps'],['none'],'Beginner',['Start in a strong plank.','Lower chest with control.','Press back to plank.'],'Keep spine neutral; use elevated hands if needed.',['Incline Push-up']],
    ['Dumbbell Row','A unilateral pulling movement.',['back','biceps'],['dumbbells'],'Intermediate',['Support one hand on a bench.','Pull elbow toward hip.','Lower with control.'],'Avoid twisting the torso.',['Resistance Band Row']]
  ] as const;
  for (const [name,description,targetMuscles,equipment,difficulty,instructions,safetyNotes,alternatives] of exercises) await prisma.exercise.upsert({where:{name},update:{},create:{name,description,targetMuscles,equipment,difficulty,instructions,safetyNotes,alternatives}});
}
main().finally(() => prisma.$disconnect());
