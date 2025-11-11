import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonModal } from '@ionic/angular';
import { StepperComponent } from 'src/app/components/stepper/stepper.component';
import type { OverlayEventDetail } from '@ionic/core';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.page.html',
  styleUrls: ['./shipping.page.scss'],
  imports: [IonicModule, StepperComponent]
})
export class ShippingPage implements OnInit {
  packages = [
    {
      "object_state": "VALID",
      "status": "SUCCESS",
      "object_created": "2023-11-29T16:31:19.512Z",
      "object_updated": "2023-11-29T16:31:19.512Z",
      "object_id": "5695ae3a5eda41ba9abdbf347fd545f3",
      "object_owner": "test@shippo.com",
      "test": false,
      "rate": "693ea14a541f44e090291b929c171d5a",
      "tracking_number": "9102969010383081813033",
      "tracking_status": "DELIVERED",
      "eta": "2023-11-24T00:00:00Z",
      "tracking_url_provider": "https:\/\/tools.usps.com\/go\/TrackConfirmAction_input?origTrackNum=9102969010383081813033",
      "label_url": "https:\/\/shippo-delivery-east.s3.amazonaws.com\/5695ae3a5eda41ba9abdbf347fd545f3.pdf?Signature=AyiitLq2g%2F2R9fjboCTVxi5z7JQ%3D&Expires=1534873886&AWSAccessKeyId=AKIAJGLCC5MYLLWIG42A",
      "commercial_invoice_url": null,
      "messages": [],
      "order": "ca760ef0099040b4a2b7feec827bca88",
      "metadata": "",
      "parcel": "e0de043b2f7f4b6d8e6f23ad69641cc1",
      "billing": {"payments": []}
    },
    {
      "object_state": "VALID",
      "status": "SUCCESS",
      "object_created": "2023-11-29T16:31:19.512Z",
      "object_updated": "2023-11-29T16:31:19.512Z",
      "object_id": "5695ae3a5eda41ba9abdbf347fd545f3",
      "object_owner": "test@shippo.com",
      "test": false,
      "rate": "693ea14a541f44e090291b929c171d5a",
      "tracking_number": "9102969010383081813033",
      "tracking_status": "PRE_TRANSIT",
      "eta": "2023-11-24T00:00:00Z",
      "tracking_url_provider": "https:\/\/tools.usps.com\/go\/TrackConfirmAction_input?origTrackNum=9102969010383081813033",
      "label_url": "https:\/\/shippo-delivery-east.s3.amazonaws.com\/5695ae3a5eda41ba9abdbf347fd545f3.pdf?Signature=AyiitLq2g%2F2R9fjboCTVxi5z7JQ%3D&Expires=1534873886&AWSAccessKeyId=AKIAJGLCC5MYLLWIG42A",
      "commercial_invoice_url": null,
      "messages": [],
      "order": "ca760ef0099040b4a2b7feec827bca88",
      "metadata": "",
      "parcel": "e0de043b2f7f4b6d8e6f23ad69641cc1",
      "billing": {"payments": []}
    },
    {
      "object_state": "VALID",
      "status": "SUCCESS",
      "object_created": "2023-11-29T16:31:19.512Z",
      "object_updated": "2023-11-29T16:31:19.512Z",
      "object_id": "5695ae3a5eda41ba9abdbf347fd545f3",
      "object_owner": "test@shippo.com",
      "test": false,
      "rate": "693ea14a541f44e090291b929c171d5a",
      "tracking_number": "9102969010383081813033",
      "tracking_status": "TRANSIT",
      "eta": "2023-11-24T00:00:00Z",
      "tracking_url_provider": "https:\/\/tools.usps.com\/go\/TrackConfirmAction_input?origTrackNum=9102969010383081813033",
      "label_url": "https:\/\/shippo-delivery-east.s3.amazonaws.com\/5695ae3a5eda41ba9abdbf347fd545f3.pdf?Signature=AyiitLq2g%2F2R9fjboCTVxi5z7JQ%3D&Expires=1534873886&AWSAccessKeyId=AKIAJGLCC5MYLLWIG42A",
      "commercial_invoice_url": null,
      "messages": [],
      "order": "ca760ef0099040b4a2b7feec827bca88",
      "metadata": "",
      "parcel": "e0de043b2f7f4b6d8e6f23ad69641cc1",
      "billing": {"payments": []}
    }
  ]

  @ViewChild(IonModal) modal!: IonModal;
  
  constructor() { }

  ngOnInit() {
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss('', 'confirm');
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      
    }
  }
}
