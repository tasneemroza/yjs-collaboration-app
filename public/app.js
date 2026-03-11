import * as Y from "https://esm.sh/yjs"
import { HocuspocusProvider } from "https://esm.sh/@hocuspocus/provider"

const editor = document.getElementById("textEditor")

const ydoc = new Y.Doc()

const provider = new HocuspocusProvider({
url: `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:1240`,
  name: "file-document-share",
  document: ydoc
})

const sharedText = ydoc.getText("content")

let updating = false

sharedText.observe(() => {
  updating = true
  editor.value = sharedText.toString()
  updating = false
})

editor.addEventListener("input", () => {

  if (updating) return

  const current = sharedText.toString()
  const newText = editor.value

  if(current === newText) return

  ydoc.transact(() => {
    sharedText.delete(0, current.length)
    sharedText.insert(0, newText)
  })

})