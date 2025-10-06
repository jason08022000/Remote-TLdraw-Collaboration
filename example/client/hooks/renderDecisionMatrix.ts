import { Editor, toRichText, TLTextShape, TLShapePartial } from 'tldraw'
import { createShapeId } from '@tldraw/tlschema'

props: { richText: toRichText('...') }


function addText(editor: Editor, x: number, y: number, text: string) {
  const id = createShapeId()
  const shape: TLShapePartial<TLTextShape> = {
    id,
    type: 'text',
    x, y,
    props: { richText: toRichText(text) },
  }
  editor.createShapes([shape])
  return id
}
