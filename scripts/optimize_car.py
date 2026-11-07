import bpy
from pathlib import Path

root = Path(__file__).resolve().parent.parent
source = root / 'models' / 'f1-car-wheels-v2.glb'
if not source.exists():
    source = root / 'public' / 'f1-car-wheels-v2.glb'
output = root / 'public' / 'f1-car-optimized.glb'

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
for image in bpy.data.images:
    if image.source == 'FILE' and max(image.size) > 2048:
        print('Optimizing texture', image.name, list(image.size), flush=True)
        image.scale(2048, 2048)
        image.pack()
bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', export_lights=False)
print('Saved', output, flush=True)
