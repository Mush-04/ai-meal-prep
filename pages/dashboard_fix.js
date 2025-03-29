                  <div className="text-center p-8">
                    <p className="text-gray-500 mb-4">Ingen profildata funnet. Vennligst oppdater profilen din.</p>
                    <button 
                      onClick={fetchProfileData} 
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                    >
                      Oppdater profil
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
