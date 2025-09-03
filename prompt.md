



        This error Occurs only when i add image URL. It gets displayed correctly inside the editing card, but once I click on Créer l'annonce button, i get "Erreur lors de la création de l'annonce. Veuillez réessayer.

"


From the console,         error: (error) => {
          console.error(`❌ [ANNONCE-${this.isEditMode ? 'EDIT' : 'CREATE'}] Error ${this.isEditMode ? 'updating' : 'creating'} annonce:`, error);
          this.submitMessage = `Erreur lors de ${this.isEditMode ? 'la modification' : 'la création'} de l'annonce. Veuillez réessayer.`;
          this.isSubmitting = false;
        }


        So please fix, i want to image to be displayed in the card of Annonces on my dashboard.