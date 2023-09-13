import html2canvas from 'html2canvas';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;


export abstract class Printable {

  // app button
  public btnPrint = true;
  public loading = false;


  /*************************************************************************
 *  Print to PDF  
 */
  print = () => {
    // console.log("Print");
    this.loading = true;  // loading spinner

    // prepare ag-grid for printing
    this.printPrepare(true);

    const A4 = { width: 595.28, height: 841.89 };  //A$ page constant
    const margin = 40;  // page margin on PDF

    html2canvas(document.getElementById('pdfImg'), {
      scrollX: 0,
      scrollY: 0,
    }).then(canvas => {

      let docDefinition = {
        // header: 'Bob PDF Header',   // header
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: margin, // [40, 40, 40, 40],
        content: []
      };

      let remaining_h = 0;
      let pages = 0;
      do {
        // create new canvas
        let pageCanvas = document.createElement('canvas');
        // assign same width
        pageCanvas.width = canvas.width;
        // calcualte page max height
        pageCanvas.height = A4.height * canvas.width / A4.width;

        // vertical offset
        const offset = pages * pageCanvas.height;
        // calculate remaining h
        remaining_h = Math.max(canvas.height - pageCanvas.height - offset, 0);


        // copy canvas to pageCanvas
        pageCanvas.getContext('2d').drawImage(canvas,
          0, offset, canvas.width, canvas.height,     // source
          0, 0, canvas.width, canvas.height   // destination
        );

        // convert to base64 char img
        let imgData = pageCanvas.toDataURL("image/png", 1.0);   // convert page to img

        // push page to array
        docDefinition.content.push({
          image: imgData,
          width: A4.width - 2 * margin,   // calculate width
          heigth: 'auto',
          x: 0,
          y: 0,
          pageBreak: remaining_h > 0 ? 'after' : undefined,
        });

        pages++;
      } while (remaining_h > 0);


      pdfMake.createPdf(docDefinition).open();

      // restore ag-grid layout
      this.printPrepare(false);
      this.loading = false;

    });
  }


  /************************************************* */
  // to be extended by children component
  protected abstract printPrepare(value: boolean) : void;

}

