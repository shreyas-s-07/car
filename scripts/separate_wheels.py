import bpy, bmesh
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(ROOT / 'models' / 'f1-car-original.glb'))
body=next(o for o in bpy.context.scene.objects if o.type=='MESH')
for name, side, axle_z, inner in [('wheel_rear_left',-1,-.370,.145),('wheel_rear_right',1,-.370,.145),('wheel_front_left',-1,.396,.182),('wheel_front_right',1,.396,.182)]:
 bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); bpy.context.view_layer.objects.active=body
 bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='DESELECT'); bm=bmesh.from_edit_mesh(body.data); bm.faces.ensure_lookup_table()
 count=0
 for face in bm.faces:
  center = face.calc_center_median()
  if side*center.x >= inner - .004 and ((center.z-axle_z)**2 + (center.y-.082)**2) <= .088**2:
   face.select_set(True); count+=1
 bmesh.update_edit_mesh(body.data)
 print('WHEEL_SELECTION',name,count,flush=True)
 if count < 100: raise RuntimeError('Wheel selection too small: '+name)
 bpy.ops.mesh.separate(type='SELECTED'); bpy.ops.object.mode_set(mode='OBJECT')
 wheel=next(o for o in bpy.context.selected_objects if o != body); wheel.name=name
 center=Vector((side * (.205 if inner == .145 else .225), .082, axle_z))
 for vertex in wheel.data.vertices: vertex.co -= center
 wheel.location += wheel.matrix_local.to_3x3() @ center
 bpy.context.view_layer.update()
bpy.ops.export_scene.gltf(filepath=str(ROOT / 'public' / 'f1-car-wheels-v2.glb'),export_format='GLB',export_lights=False)
print('EXPORTED',flush=True)
